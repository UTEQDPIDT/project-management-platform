import { Module } from '@nestjs/common';
import { StandaloneProductsService } from './standalone-products.service';
import { StandaloneProductsController } from './standalone-products.controller';
import {
  StandaloneProduct,
  StandaloneProductSchema,
} from '../schemas/standalone-product.schema';
import { Team, TeamSchema } from '../schemas/team.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StandaloneProduct.name, schema: StandaloneProductSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
    FilesModule,
  ],
  providers: [StandaloneProductsService],
  controllers: [StandaloneProductsController],
  exports: [StandaloneProductsService],
})
export class StandaloneProductsModule {}
