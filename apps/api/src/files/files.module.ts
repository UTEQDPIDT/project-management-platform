import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../schemas/file.schema';
import { FileResourceInterceptor } from './interceptors/file-resource.interceptor';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    CaslModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, FileResourceInterceptor],
  exports: [FilesService],
})
export class FilesModule {}
