import { BadRequestException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { ProjectStatus, ProjectValidation, Status, UserType } from '@repo/types';
import { Types } from 'mongoose';
import { Writable } from 'node:stream';
import { Activity } from '../schemas/activities.schema';
import { Project } from '../schemas/project.schema';
import { User } from '../schemas/user.schema';
import { Recognition } from './document.schema';
import { DocumentsService } from './documents.service';
import { renderRecognition } from './recognition-pdf';

jest.mock('./recognition-pdf', () => ({ renderRecognition: jest.fn() }));

describe('DocumentsService eligibility', () => {
  const userId = '507f1f77bcf86cd799439011';
  const projectId = '507f1f77bcf86cd799439012';
  const membershipId = '507f1f77bcf86cd799439013';
  const users = { findOne: jest.fn() };
  const projects = { find: jest.fn(), findById: jest.fn() };
  const activities = { find: jest.fn() };
  const recognitions = { findById: jest.fn(), findOneAndUpdate: jest.fn() };
  let service: DocumentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    users.findOne.mockResolvedValue({ _id: userId, type: UserType.MAESTRO });
    const module = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getConnectionToken(), useValue: { db: { collection: () => ({}) } } },
        { provide: getModelToken(Recognition.name), useValue: recognitions },
        { provide: getModelToken(User.name), useValue: users },
        { provide: getModelToken(Project.name), useValue: projects },
        { provide: getModelToken(Activity.name), useValue: activities },
      ],
    }).compile();
    service = module.get(DocumentsService);
  });

  it('lists owned or active selected team projects, excluding other memberships', async () => {
    const fixtures = [
      { _id: projectId, name: 'Owner', owner: userId },
      { _id: 'p2', name: 'Member', team: { memberships: [{ _id: membershipId, user: userId, status: 'ACTIVE' }] } },
      { _id: 'p3', name: 'Excluded', team: { memberships: [{ _id: membershipId, user: userId, status: 'ACTIVE' }] }, excludedTeamMemberships: [membershipId] },
      { _id: 'p4', name: 'Pending', team: { memberships: [{ _id: membershipId, user: userId, status: 'PENDING' }] } },
    ];
    projects.find.mockReturnValue({
      select: () => ({ populate: () => Promise.resolve(fixtures) }),
    });

    await expect(service.eligibleProjects(userId)).resolves.toEqual([
      { _id: projectId, name: 'Owner' }, { _id: 'p2', name: 'Member' },
    ]);
    expect(projects.find).toHaveBeenCalledWith({
      validationStatus: { $ne: ProjectValidation.UNDER_REVIEW },
    });
  });

  it.each([
    { validationStatus: ProjectValidation.UNDER_REVIEW, owner: userId },
    { validationStatus: ProjectValidation.FIRST_VALIDATION, owner: 'another-user' },
    { validationStatus: ProjectValidation.FIRST_VALIDATION, team: { memberships: [{ _id: membershipId, user: userId, status: 'ACTIVE' }] }, excludedTeamMemberships: [membershipId] },
  ])('refuses issuance for ineligible projects', async (project) => {
    projects.findById.mockReturnValue({
      populate: () => ({ populate: () => Promise.resolve(project) }),
    });
    await expect(service.create({ userId, projectId, folio: '123' })).rejects.toBeInstanceOf(BadRequestException);
    expect(activities.find).not.toHaveBeenCalled();
  });

  it('refreshes current project data without changing the user, project, folio or issuance date', async () => {
    const id = '507f1f77bcf86cd799439014';
    const oldFileId = new Types.ObjectId();
    const newFileId = new Types.ObjectId();
    const issuedAt = new Date('2025-03-10T18:00:00Z');
    const existing = {
      userId: new Types.ObjectId(userId), projectId: new Types.ObjectId(projectId),
      fileId: oldFileId, folio: '123', year: 2025, issuedAt,
    };
    const user = { _id: new Types.ObjectId(userId), givenName: 'María', familyName: 'Pérez', email: 'maria@example.test' };
    const project = {
      _id: new Types.ObjectId(projectId), owner: user._id,
      validationStatus: ProjectValidation.FIRST_VALIDATION,
      name: 'Proyecto actualizado', objective: 'Objetivo actualizado', status: ProjectStatus.IN_PROGRESS,
    };
    users.findOne.mockResolvedValue(user);
    projects.findById.mockReturnValue({
      populate: () => ({ populate: () => Promise.resolve(project) }),
    });
    activities.find.mockReturnValue({ lean: () => Promise.resolve([
      { name: 'Terminada', status: Status.COMPLETED },
      { name: 'Pendiente', status: Status.PENDING },
    ]) });
    recognitions.findById.mockResolvedValue(existing);
    recognitions.findOneAndUpdate.mockResolvedValue({ ...existing, fileId: newFileId });
    jest.mocked(renderRecognition).mockResolvedValue(Buffer.from('%PDF'));
    const stream = Object.assign(new Writable({ write(_chunk, _encoding, callback) { callback(); } }), { id: newFileId });
    const bucket = { openUploadStream: jest.fn().mockReturnValue(stream), delete: jest.fn().mockResolvedValue(undefined) };
    Object.defineProperty(service, 'bucket', { value: bucket });

    await service.refresh(id);

    expect(renderRecognition).toHaveBeenCalledWith(expect.objectContaining({
      userName: 'María Pérez', projectName: 'Proyecto actualizado',
      objective: 'Objetivo actualizado', progress: 50, folio: '123', year: 2025, issuedAt,
      activities: [
        { name: 'Terminada', status: Status.COMPLETED, dueDate: undefined },
        { name: 'Pendiente', status: Status.PENDING, dueDate: undefined },
      ],
    }));
    expect(recognitions.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id, fileId: oldFileId },
      expect.objectContaining({ userId: user._id, projectId: project._id, fileId: newFileId }),
      { new: true },
    );
    const changes = recognitions.findOneAndUpdate.mock.calls[0][1];
    expect(changes).not.toHaveProperty('folio');
    expect(changes).not.toHaveProperty('issuedAt');
    expect(bucket.delete).toHaveBeenCalledWith(oldFileId);
  });

  it('does not replace a constancia when the project is no longer eligible', async () => {
    const id = '507f1f77bcf86cd799439014';
    recognitions.findById.mockResolvedValue({
      userId: new Types.ObjectId(userId), projectId: new Types.ObjectId(projectId),
      issuedAt: new Date(), folio: '123', year: 2025,
    });
    projects.findById.mockReturnValue({
      populate: () => ({ populate: () => Promise.resolve({
        validationStatus: ProjectValidation.UNDER_REVIEW, owner: userId,
      }) }),
    });

    await expect(service.refresh(id)).rejects.toBeInstanceOf(BadRequestException);
    expect(recognitions.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
