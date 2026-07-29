import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../schemas/file.schema';
import { mongo } from 'mongoose';
import {
  EntityType,
  FilePurpose,
  ProjectStatus,
  ProjectValidation,
  UserRole,
} from '@repo/types';
import { Project } from '../schemas/project.schema';
import { Activity } from '../schemas/activities.schema';
import { Product } from '../schemas/product.schema';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';
import { hasProjectCollaborationAccess } from '../common/security/project-collaboration.helper';

@Injectable()
export class FilesService {
  private bucket: mongo.GridFSBucket;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Activity.name) private readonly activityModel: Model<Activity>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {
    this.bucket = new mongo.GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  private toId(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof (value as { toString?: () => string }).toString === 'function') {
      return (value as { toString: () => string }).toString();
    }

    return null;
  }

  private normalizeEntityType(value: EntityType | string | null | undefined): EntityType | null {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();

    if (normalized === EntityType.PROJECT) return EntityType.PROJECT;
    if (normalized === EntityType.ACTIVITY) return EntityType.ACTIVITY;
    if (normalized === EntityType.PRODUCT) return EntityType.PRODUCT;
    if (normalized === EntityType.EVENT) return EntityType.EVENT;
    if (normalized === EntityType.STANDALONE_PRODUCT) return EntityType.STANDALONE_PRODUCT;

    return null;
  }

  private async resolveParentProjectId(
    entityId: string,
    entityType: EntityType | string,
  ): Promise<string | null> {
    const normalizedEntityType = this.normalizeEntityType(entityType);

    if (normalizedEntityType === EntityType.PROJECT) {
      return entityId;
    }

    if (normalizedEntityType === EntityType.ACTIVITY) {
      const activity = await this.activityModel
        .findById(entityId)
        .select('entityType entityId');

      if (!activity) {
        throw new NotFoundException(`Activity with ID: ${entityId} not found`);
      }

      const activityEntityType = this.normalizeEntityType(
        activity.entityType as EntityType | string,
      );

      if (activityEntityType === EntityType.PROJECT) {
        return activity.entityId.toString();
      }

      return null;
    }

    if (normalizedEntityType === EntityType.PRODUCT) {
      const product = await this.productModel.findById(entityId).select('projectId');

      if (!product) {
        throw new NotFoundException(`Product with ID: ${entityId} not found`);
      }

      return product.projectId.toString();
    }

    return null;
  }

  private async ensureProjectAllowsFileWrites(
    entityId: string,
    entityType: EntityType | string,
  ) {
    const parentProjectId = await this.resolveParentProjectId(entityId, entityType);

    if (!parentProjectId) {
      return;
    }

    const project = await this.projectModel
      .findById(parentProjectId)
      .select('status validationStatus');

    if (!project) {
      throw new NotFoundException(`Project with ID: ${parentProjectId} not found`);
    }

    if (
      project.status === ProjectStatus.CLOSED ||
      project.validationStatus === ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('Files cannot be modified on closed projects.');
    }
  }

  private async hasParentProjectAccess(
    entityId: string,
    entityType: EntityType | string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<boolean> {
    const parentProjectId = await this.resolveParentProjectId(entityId, entityType);

    if (!parentProjectId) {
      return false;
    }

    const project = await this.projectModel
      .findById(parentProjectId)
      .select('owner team')
      .populate({ path: 'team', select: 'memberships' });

    if (!project) {
      throw new NotFoundException(`Project with ID: ${parentProjectId} not found`);
    }

    return hasProjectCollaborationAccess(project, actorId, actorRole, (value) =>
      this.toId(value),
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    entityId: string,
    entityType: EntityType,
    purpose: FilePurpose,
    userId: string,
    actorRole?: UserRole,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    await this.ensureProjectAllowsFileWrites(entityId, entityType);

    if (
      actorRole &&
      (await this.resolveParentProjectId(entityId, entityType)) &&
      !(await this.hasParentProjectAccess(entityId, entityType, userId, actorRole))
    ) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.FILE_PROJECT_ACCESS_FORBIDDEN,
        message: 'You are not allowed to manage files for this project.',
        resourceType: 'file',
        resourceId: entityId,
        actorId: userId,
        actorRole,
      });
    }

    await this.validateUploadRules(file, entityId, entityType, purpose);

    // 1. Upload to gridFs
    const gridFsId = await this.uploadToGridFS(file);

    try {
      // 2. Save metadata to File collection
      const savedFile = await this.fileModel.create({
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        entityId,
        entityType,
        purpose,
        owner: userId,
        url: `/files/${gridFsId}`,
        gridFsId,
      });

      return savedFile;
    } catch (error: any) {
      // Delete file from GridFS when file metadata throws
      await this.bucket.delete(new mongoose.Types.ObjectId(gridFsId));

      throw new BadRequestException(error.message);
    }
  }

  private async validateUploadRules(
    file: Express.Multer.File,
    entityId: string,
    entityType: EntityType,
    purpose: FilePurpose,
  ) {
    if (purpose !== FilePurpose.PROJECT_FINANCIAL_REPORT) {
      return;
    }

    const normalizedEntityType = this.normalizeEntityType(entityType);

    if (normalizedEntityType !== EntityType.PROJECT) {
      throw new BadRequestException(
        'PROJECT_FINANCIAL_REPORT solo puede usarse con proyectos',
      );
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'El informe financiero del proyecto debe ser un PDF',
      );
    }

    const existingFinancialReport = await this.fileModel.exists({
      entityId,
      entityType: EntityType.PROJECT,
      purpose: FilePurpose.PROJECT_FINANCIAL_REPORT,
    });

    if (existingFinancialReport) {
      throw new BadRequestException(
        'El proyecto ya cuenta con un informe financiero',
      );
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
    entityId: string,
    entityType: EntityType,
    purpose: FilePurpose,
    userId: string,
    actorRole?: UserRole,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles: File[] = [];

    try {
      for (const file of files) {
        const savedFile = await this.uploadFile(
          file,
          entityId,
          entityType,
          purpose,
          userId,
          actorRole,
        );

        uploadedFiles.push(savedFile);
      }

      return {
        message: 'Uploaded Files Successfully',
        entityId,
        entityType,
        files: uploadedFiles,
      };
    } catch (error: any) {
      await this.deleteFilesForResource(uploadedFiles);
      throw new BadRequestException(error.message);
    }
  }

  async uploadToGridFS(
    file: Express.Multer.File,
  ): Promise<mongoose.Types.ObjectId> {
    return new Promise((res, rej) => {
      // Upload buffer to GridFS
      const uploadStream = this.bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      uploadStream.end(file.buffer);

      // On finish return stream id (gridFsId)
      uploadStream.on('finish', () => {
        res(uploadStream.id as mongoose.Types.ObjectId);
      });

      // On error reject
      uploadStream.on('error', rej);
    });
  }

  async findAll(): Promise<File[]> {
    return this.fileModel.find().populate('owner').exec();
  }
  // This method checks if an activity has at least one evidence file before allowing it to be marked as completed.
  async activityHasEvidence(activityId: string): Promise<boolean> {
    const evidenceFiles = await this.fileModel.exists({
      entityId: activityId,
      entityType: EntityType.ACTIVITY,
    });

    return !!evidenceFiles;
  }

  async findFilesForEntity(entityId: string) {
    return this.fileModel.find({ entityId }).populate('owner').exec();
  }

  async findFilesByOwner(userId: string) {
    return this.fileModel.find({ owner: userId }).populate('owner').exec();
  }

  async getStream(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid file ID');
    }

    const metadata = await this.getFileMetadata(id);

    return {
      metadata,
      stream: await this.getFileStream(metadata.gridFsId.toHexString()),
    };
  }

  async getFileStream(
    id: string,
  ): Promise<mongoose.mongo.GridFSBucketReadStream> {
    return this.bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
  }

  async getFileMetadata(id: string): Promise<File> {
    const metadata = await this.fileModel.findById(id);

    if (!metadata) {
      throw new NotFoundException('File metadata not found');
    }

    return metadata;
  }

  private async removeFileMetadataAndBlob(file: File): Promise<File> {
    let deletedFile: File;

    try {
      deletedFile = await this.fileModel.findByIdAndDelete(file._id.toString());
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    try {
      await this.bucket.delete(new mongoose.Types.ObjectId(file.gridFsId));
    } catch (error) {
      // IMPORTANT: do not fail the request
      // Todo: cleanup cron job for orphaned GridFS files
      console.error(
        `Failed to delete GridFS file ${file.gridFsId.toString()}`,
        error,
      );
    }

    return deletedFile;
  }

  async deleteFile(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<File> {
    // extract file metadata
    const file = await this.fileModel.findById(id);

    if (!file) {
      throw new NotFoundException('File metadata not found');
    }

    const ownerId = this.toId(file.owner);
    const hasProjectAccess = await this.hasParentProjectAccess(
      file.entityId.toString(),
      file.entityType,
      actorId,
      actorRole,
    );

    if (hasProjectAccess) {
      await this.ensureProjectAllowsFileWrites(file.entityId.toString(), file.entityType);

      return this.removeFileMetadataAndBlob(file);
    }

    if (!ownerId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.FILE_OWNER_MISSING,
        message: 'File owner is not defined.',
        resourceType: 'file',
        resourceId: id,
        actorId,
        actorRole,
      });
    }

    if (actorRole !== UserRole.ADMIN && ownerId !== actorId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.FILE_DELETE_NOT_OWNER,
        message: 'You are not allowed to delete this file.',
        resourceType: 'file',
        resourceId: id,
        actorId,
        actorRole,
      });
    }

    await this.ensureProjectAllowsFileWrites(file.entityId.toString(), file.entityType);

    return this.removeFileMetadataAndBlob(file);
  }

  async deleteFiles(files: File[], actorId: string, actorRole: UserRole) {
    for (const file of files) {
      await this.deleteFile(file._id.toString(), actorId, actorRole);
    }
  }

  async deleteFilesForResource(files: File[]) {
    for (const file of files) {
      await this.ensureProjectAllowsFileWrites(
        file.entityId.toString(),
        file.entityType,
      );
      await this.removeFileMetadataAndBlob(file);
    }
  }

  async deleteFilesByOwner(
    ownerId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    if (actorRole !== UserRole.ADMIN && actorId !== ownerId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.FILE_BULK_DELETE_FORBIDDEN,
        message: 'You are not allowed to delete files for this owner.',
        resourceType: 'file-owner',
        resourceId: ownerId,
        actorId,
        actorRole,
      });
    }

    try {
      const files = await this.fileModel.find({ owner: ownerId });

      await this.deleteFiles(files, actorId, actorRole);

      return {
        message: 'Files deleted successfully',
        deletedCount: files.length,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
