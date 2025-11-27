import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import mongoose from 'mongoose';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const savedFile = this.filesService.uploadToGridFS(
      file,
      '69286fe44f801bd12854f4f0',
    );
    return savedFile;
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid file ID');
    }

    const metadata = await this.filesService.getFileMetadata(id);

    if (!metadata) {
      throw new NotFoundException('File metadata not found');
    }

    const fileStream = await this.filesService.getFileStream(
      metadata.gridFsId.toHexString(),
    );

    fileStream.on('error', () => res.status(404).send('File not found'));

    fileStream.pipe(res);
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid file ID');
    }

    // 1. get file metadata
    const metadata = await this.filesService.getFileMetadata(id);

    if (!metadata) {
      throw new NotFoundException('File metadata not found');
    }

    // 2. get GridFS download stream
    const fileStream = await this.filesService.getFileStream(
      metadata.gridFsId.toHexString(),
    );

    // 3. set headers
    res.set({
      'Content-Type': metadata.mimetype || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${metadata.name}"`,
    });

    // 4. Pipe GridFS strem to the response
    fileStream.on('error', () => {
      return res.status(404).send('Could not read file');
    });

    fileStream.pipe(res);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }
}
