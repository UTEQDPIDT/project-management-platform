import {
  BadRequestException, ConflictException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { EntityType, ProjectStatus, ProjectValidation, Status, UserRole, UserType } from '@repo/types';
import { Connection, Model, mongo, Types } from 'mongoose';
import { hasProjectCollaborationAccess } from '../common/security/project-collaboration.helper';
import { Activity } from '../schemas/activities.schema';
import { Project } from '../schemas/project.schema';
import { User } from '../schemas/user.schema';
import { Recognition } from './document.schema';
import { CreateRecognitionDto, UpdateRecognitionDto } from './dto/recognition.dto';
import { renderRecognition } from './recognition-pdf';

@Injectable()
export class DocumentsService {
  private readonly bucket: mongo.GridFSBucket;
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectConnection() connection: Connection,
    @InjectModel(Recognition.name) private readonly recognitions: Model<Recognition>,
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Project.name) private readonly projects: Model<Project>,
    @InjectModel(Activity.name) private readonly activities: Model<Activity>,
  ) {
    this.bucket = new mongo.GridFSBucket(connection.db, { bucketName: 'recognitions' });
  }

  private readonly id = (value: unknown): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Types.ObjectId) return value.toHexString();
    if (typeof value === 'object' && '_id' in value) return this.id(value._id);
    return null;
  };

  private validId(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Identificador inválido.');
  }

  async teachers() {
    return this.users.find({ type: UserType.MAESTRO })
      .select('givenName familyName email')
      .sort({ givenName: 1, familyName: 1 }).lean();
  }

  async eligibleProjects(userId: string) {
    this.validId(userId);
    const user = await this.users.findOne({ _id: userId, type: UserType.MAESTRO });
    if (!user) throw new NotFoundException('Docente no encontrado.');
    const projects = await this.projects
      .find({ validationStatus: { $ne: ProjectValidation.UNDER_REVIEW } })
      .select('name owner team excludedTeamMemberships validationStatus')
      .populate({ path: 'team', select: 'memberships' });
    return projects
      .filter((project) =>
        project.validationStatus !== ProjectValidation.UNDER_REVIEW &&
        hasProjectCollaborationAccess(project, userId, UserRole.USER, this.id),
      )
      .map((project) => ({ _id: project._id, name: project.name }));
  }

  list() {
    return this.recognitions.find().select('-fileId').sort({ issuedAt: -1 }).lean();
  }

  async getFile(id: string): Promise<Buffer> {
    this.validId(id);
    const recognition = await this.recognitions.findById(id);
    if (!recognition) throw new NotFoundException('Constancia no encontrada.');
    const chunks: Buffer[] = [];
    for await (const chunk of this.bucket.openDownloadStream(recognition.fileId)) {
      if (!Buffer.isBuffer(chunk)) throw new Error('El archivo de constancia contiene datos inválidos.');
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private async prepare(userId: string, projectId: string, issuedAt: Date, folio: string, year: number) {
    this.validId(userId);
    this.validId(projectId);
    const user = await this.users.findOne({ _id: userId, type: UserType.MAESTRO });
    if (!user) throw new NotFoundException('Docente no encontrado.');
    const project = await this.projects.findById(projectId)
      .populate({ path: 'team', select: 'memberships' })
      .populate('impactAreas prioritiesPND sustainableObjectives innovationLines innovationLinesSubcategories');
    if (!project) throw new NotFoundException('Proyecto no encontrado.');
    if (project.validationStatus === ProjectValidation.UNDER_REVIEW ||
      !hasProjectCollaborationAccess(project, userId, UserRole.USER, this.id)) {
      throw new BadRequestException('El proyecto no es elegible para este docente.');
    }
    const activities = await this.activities.find({ entityId: project._id, entityType: EntityType.PROJECT }).lean();
    const progress = activities.length
      ? Math.round(100 * activities.filter((activity) => activity.status === Status.COMPLETED).length / activities.length)
      : 0;
    const userName = [user.givenName, user.familyName].filter(Boolean).join(' ');
    if (!userName) throw new BadRequestException('El docente no tiene nombre registrado.');
    const names = (values: { name: string }[] | undefined) => (values || []).map((value) => value.name);
    const statusLabels: Record<ProjectStatus, string> = {
      [ProjectStatus.PENDING]: 'Pendiente',
      [ProjectStatus.IN_PROGRESS]: 'En progreso',
      [ProjectStatus.COMPLETED]: 'Completado',
      [ProjectStatus.CLOSED]: 'Cerrado',
    };
    const pdf = await renderRecognition({
      issuedAt, folio, year, userName, projectName: project.name,
      objective: project.objective, projectStatus: statusLabels[project.status] || project.status, progress,
      startDate: project.startDate, endDate: project.endDate,
      impacts: names(project.impactAreas), sustainability: names(project.sustainableObjectives),
      priorities: names(project.prioritiesPND), lines: names(project.innovationLines),
      subcategories: names(project.innovationLinesSubcategories),
      activities: activities.map((activity) => ({
        name: activity.name, status: activity.status, dueDate: activity.dueDate,
      })),
    });
    return { user, project, userName, pdf };
  }

  private async upload(pdf: Buffer): Promise<Types.ObjectId> {
    const stream = this.bucket.openUploadStream('constancia.pdf', {
      contentType: 'application/pdf',
    });
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.end(pdf);
    });
    return stream.id;
  }

  private async cleanup(fileId: Types.ObjectId) {
    try {
      await this.bucket.delete(fileId);
    } catch (error) {
      this.logger.error(`No se pudo eliminar el archivo de constancia ${fileId.toHexString()}`, error);
    }
  }

  async create(dto: CreateRecognitionDto) {
    const issuedAt = new Date();
    const year = Number(new Intl.DateTimeFormat('en', {
      year: 'numeric', timeZone: 'America/Mexico_City',
    }).format(issuedAt));
    const folio = dto.folio.toUpperCase();
    const { user, project, userName, pdf } = await this.prepare(dto.userId, dto.projectId, issuedAt, folio, year);
    const fileId = await this.upload(pdf);
    try {
      return await this.recognitions.create({
        userId: user._id, userName, userEmail: user.email, userAvatarUrl: user.avatarUrl,
        projectId: project._id, projectName: project.name,
        issuedAt, folio, year, fileId,
      });
    } catch (error) {
      await this.cleanup(fileId);
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new ConflictException('El folio ya existe para este año.');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateRecognitionDto) {
    return this.replace(id, dto);
  }

  async refresh(id: string) {
    return this.replace(id);
  }

  private async replace(id: string, dto?: UpdateRecognitionDto) {
    this.validId(id);
    const existing = await this.recognitions.findById(id);
    if (!existing) throw new NotFoundException('Constancia no encontrada.');
    const { user, project, userName, pdf } = await this.prepare(
      dto?.userId ?? existing.userId.toString(),
      dto?.projectId ?? existing.projectId.toString(),
      existing.issuedAt, existing.folio, existing.year,
    );
    const fileId = await this.upload(pdf);
    let updated: Recognition | null;
    try {
      updated = await this.recognitions.findOneAndUpdate(
        { _id: id, fileId: existing.fileId },
        { userId: user._id, userName, userEmail: user.email, userAvatarUrl: user.avatarUrl,
          projectId: project._id, projectName: project.name, fileId },
        { new: true },
      );
      if (!updated) throw new ConflictException('La constancia fue modificada por otro usuario. Actualice la página.');
    } catch (error) {
      await this.cleanup(fileId);
      throw error;
    }
    await this.cleanup(existing.fileId);
    return updated;
  }
}
