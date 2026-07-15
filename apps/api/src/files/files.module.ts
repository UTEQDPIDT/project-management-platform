import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../schemas/file.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Activity, ActivitySchema } from '../schemas/activities.schema';
import { Product, ProductSchema } from '../schemas/product.schema';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
