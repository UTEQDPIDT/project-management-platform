import { forwardRef, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../schemas/file.schema';
import { FileResourceInterceptor } from './interceptors/file-resource.interceptor';
import { CaslModule } from '../casl/casl.module';
import { ProjectsModule } from '../projects/projects.module';
import { EventsModule } from '../events/events.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    CaslModule,
    forwardRef(() => ProjectsModule),
    forwardRef(() => EventsModule),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => ProductsModule),

  ],
  controllers: [FilesController],
  providers: [FilesService, FileResourceInterceptor],
  exports: [FilesService],
})
export class FilesModule {}
