import { forwardRef, Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { FilesModule } from '../files/files.module';
import { ProductsModule } from '../products/products.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ProjectResourceInterceptor } from './interceptors/project-resource.interceptor';
import { CaslModule } from '../casl/casl.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    forwardRef(() => FilesModule),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => ProductsModule),
    CaslModule,
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectResourceInterceptor],
  exports: [ProjectsService],
})
export class ProjectsModule {}
