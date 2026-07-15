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
} from '@repo/types';
import { Project } from '../schemas/project.schema';
import { Activity } from '../schemas/activities.schema';
import { Product } from '../schemas/product.schema';

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

  private async resolveParentProjectId(
    entityId: string,
    entityType: EntityType,
  ): Promise<string | null> {
    if (entityType === EntityType.PROJECT) {
      return entityId;
    }

    if (entityType === EntityType.ACTIVITY) {
      const activity = await this.activityModel
        .findById(entityId)
        .select('entityType entityId');

      if (!activity) {
        throw new NotFoundException(`Activity with ID: ${entityId} not found`);
      }

      if (activity.entityType === EntityType.PROJECT) {
        return activity.entityId.toString();
      }

      return null;
    }

    if (entityType === EntityType.PRODUCT) {
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
    entityType: EntityType,
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

  async uploadFile(
    file: Express.Multer.File,
    entityId: string,
    entityType: EntityType,
    purpose: FilePurpose,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    await this.ensureProjectAllowsFileWrites(entityId, entityType);

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

    if (entityType !== EntityType.PROJECT) {
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
      await this.deleteFiles(uploadedFiles);
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

  async deleteFile(id: string): Promise<File> {
    // extract file metadata
    const file = await this.fileModel.findById(id);

    if (!file) {
      throw new NotFoundException('File metadata not found');
    }

    await this.ensureProjectAllowsFileWrites(
      file.entityId.toString(),
      file.entityType,
    );

    let deletedFile: File;
    try {
      // Delete file metadata
      deletedFile = await this.fileModel.findByIdAndDelete(id);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    try {
      // Delete file from GridFS
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

  async deleteFiles(files: File[]) {
    for (const file of files) {
      await this.deleteFile(file._id.toString());
    }
  }

  async deleteFilesByOwner(ownerId: string) {
    try {
      await this.fileModel.deleteMany({ owner: ownerId });
      return { message: 'Files deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
