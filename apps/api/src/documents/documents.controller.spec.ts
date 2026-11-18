import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@repo/types';
import { Response } from 'express';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController authorization', () => {
  const service = {
    teachers: jest.fn(), eligibleProjects: jest.fn(), list: jest.fn(),
    getFile: jest.fn(), create: jest.fn(), update: jest.fn(), refresh: jest.fn(),
  };
  const controller = new DocumentsController(service as unknown as DocumentsService);
  const user = { user: { role: UserRole.USER } };

  it('rejects non-admin users on all document endpoints', async () => {
    expect(() => controller.teachers(user)).toThrow(ForbiddenException);
    expect(() => controller.projects(user, 'id')).toThrow(ForbiddenException);
    expect(() => controller.list(user)).toThrow(ForbiddenException);
    await expect(controller.file(user, 'id', {} as Response)).rejects.toBeInstanceOf(ForbiddenException);
    expect(() => controller.create(user, { userId: 'id', projectId: 'id', folio: '1' })).toThrow(ForbiddenException);
    expect(() => controller.update(user, 'id', { userId: 'id', projectId: 'id' })).toThrow(ForbiddenException);
    expect(() => controller.refresh(user, 'id')).toThrow(ForbiddenException);
    for (const method of Object.values(service)) expect(method).not.toHaveBeenCalled();
  });
});
