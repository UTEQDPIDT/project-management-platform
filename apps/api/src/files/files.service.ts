import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../schemas/file.schema';
import { mongo } from 'mongoose';

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

  async uploadToGridFS(file: Express.Multer.File, ownerId: string) {
    // 1. Upload buffer to GridFS
    const uploadStream = this.bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    const fileId = uploadStream.id;

    return new Promise((res, rej) => {
      uploadStream.on('close', async () => {
        // 2. Save metadata to File collection
        const savedFile = await this.fileModel.create({
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          owner: ownerId,
          url: `/files/${fileId}`,
          gridFsId: fileId,
        });

        res(savedFile);
      });

      uploadStream.on('error', rej);
    });
  }

  async findAll() {
    return this.fileModel.find().exec();
  }

  async getFileStream(id: string) {
    return this.bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
  }

  async getFileMetadata(id: string) {
    return this.fileModel.findById(id);
  }

  async deleteFile(id: string) {
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

    return { message: 'File deleted successfully' };
  }
}
