import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { FilesModule } from '../files/files.module';
import { ProductsModule } from '../products/products.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ProjectResourceInterceptor } from './interceptors/project-resource.interceptor';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    FilesModule,
    ProductsModule,
    ActivitiesModule,
    CaslModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectResourceInterceptor],
})
export class ProjectsModule {}
