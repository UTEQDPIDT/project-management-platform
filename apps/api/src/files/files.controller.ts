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
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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

  //   @Get()
  //   findAll() {
  //     return this.filesService.findAll();
  //   }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const fileStream = await this.filesService.getFileStream(id);

    fileStream.on('error', () => res.status(404).send('File not found'));
    fileStream.pipe(res);
  }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.filesService.remove(id);
  //   }
}
