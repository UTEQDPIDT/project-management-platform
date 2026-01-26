import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiAcceptedResponse, ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductResourceInterceptor } from './interceptors/product-resource.interceptor';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //PRODUCT PERMISSIONS ARE INHERITED FROM THE PROJECT THEY BELONG TO
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({description: 'Producto creado correctamente', type: [CreateProductDto]})
  @ApiBadRequestResponse({description: 'Ocurrió un error al crear el producto'})
  @UseInterceptors(FileInterceptor('file'), ProductResourceInterceptor)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.productsService.create(createProductDto, file, req.user.id);
  }

  @ApiAcceptedResponse({description: 'Lista de productos obtenida correctamente.', type: [CreateProductDto]})
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiAcceptedResponse({description: 'Lista de productos de un proyecto.'})
  @UseInterceptors(ProductResourceInterceptor)
  @Get('/by-project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.productsService.findByProject(projectId);
  }

  @ApiAcceptedResponse({description: 'Producto obtenido correctamente.', type: CreateProductDto})
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @UseInterceptors(ProductResourceInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('/by-user/:userId')
  @UseInterceptors(ProductResourceInterceptor)
  findByUser(@Param('userId') userId) {
    return this.productsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiAcceptedResponse({description: 'Producto actualizado correctamente.', type: UpdateProductDto})
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @UseInterceptors(FileInterceptor('file'), ProductResourceInterceptor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFile() file: Express.Multer.File, @Req() req,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id, file);
  }

  @ApiAcceptedResponse({description: 'Producto eliminado correctamente.', type: UpdateProductDto})
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ProductResourceInterceptor)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
