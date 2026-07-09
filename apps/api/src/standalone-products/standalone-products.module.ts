import { Module } from '@nestjs/common';
import { StandaloneProductsService } from './standalone-products.service';
import { StandaloneProductsController } from './standalone-products.controller';
import { StandaloneProduct, StandaloneProductSchema } from 'src/schemas/standalone-product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StandaloneProduct.name, schema: StandaloneProductSchema }]),
    FilesModule,
  ],
  providers: [StandaloneProductsService],
  controllers: [StandaloneProductsController],
  exports: [StandaloneProductsService],
})
export class StandaloneProductsModule {}
