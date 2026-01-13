import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../schemas/file.schema';
import { mongo } from 'mongoose';
import { EntityType } from '@repo/types';

@Injectable()
export class FilesService {
  private bucket: mongo.GridFSBucket;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {
    this.bucket = new mongo.GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    entityId: string,
    entityType: EntityType,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

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
        owner: userId,
        url: `/files/${gridFsId}`,
        gridFsId,
      });

      return {
        id: savedFile._id.toString(),
        message: 'File uploaded successfully',
      };
    } catch (error: any) {
      // Delete file from GridFS when file metadata throws
      await this.bucket.delete(new mongoose.Types.ObjectId(gridFsId));

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
    return this.fileModel.find().exec();
  }

  async findFilesForEntity(entityId: string) {
    return this.fileModel.find({ entityId });
  }

  async findFilesByOwner(userId: string) {
    return this.fileModel.find({ owner: userId });
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

  async deleteFile(id: string): Promise<{ id: string; message: string }> {
    // extract file metadata
    const file = await this.fileModel.findById(id);

    if (!file) {
      throw new NotFoundException('File metadata not found');
    }

    try {
      // Delete file metadata
      await this.fileModel.findByIdAndDelete(id);
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

    return { id, message: 'File deleted successfully' };
  }

  async deleteFiles(files: File[]) {
    for (const file of files) {
      await this.deleteFile(file._id.toString());
    }
  }
}
