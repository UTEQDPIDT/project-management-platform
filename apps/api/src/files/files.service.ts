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
import { FileOwnerType } from '@repo/types';

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
    ownerId: string,
    ownerType: FileOwnerType,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const savedFile = await this.uploadToGridFS(
      file,
      ownerId,
      ownerType,
      userId,
    );

    return {
      id: savedFile._id.toString(),
      message: 'File uploaded successfully',
    };
  }

  async uploadToGridFS(
    file: Express.Multer.File,
    ownerId: string,
    ownerType: FileOwnerType,
    userId: string,
  ): Promise<File> {
    // 1. Upload buffer to GridFS
    const uploadStream = this.bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    const fileId = uploadStream.id;

    // Wait for the upload to complete
    const savedFile = await new Promise<File>((res, rej) => {
      uploadStream.on('finish', async () => {
        // 2. Save metadata to File collection
        const savedFile = await this.fileModel.create({
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          ownerId: ownerId,
          ownerType: ownerType,
          uploadedBy: userId,
          url: `/files/${fileId}`,
          gridFsId: fileId,
        });

        res(savedFile);
      });

      uploadStream.on('error', rej);
    });

    return savedFile;
  }

  async findAll(): Promise<File[]> {
    return this.fileModel.find().exec();
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

    const gridFsId = file.gridFsId;

    // Delete file from GridFS
    await this.bucket.delete(new mongoose.Types.ObjectId(gridFsId));

    // Delete file metadata
    await this.fileModel.findByIdAndDelete(id);

    return { id, message: 'File deleted successfully' };
  }
}
