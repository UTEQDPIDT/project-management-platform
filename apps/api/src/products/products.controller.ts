import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from '../common/pipes';
import { FILE_MIME_TYPES } from '../common/constants';

type AuthenticatedRequest = {
  user: {
    id: string;
  };
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Producto creado correctamente',
    type: [CreateProductDto],
  })
  @ApiBadRequestResponse({
    description: 'Ocurrió un error al crear el producto',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new FileValidationPipe(5 * 1024 * 1024, [...FILE_MIME_TYPES.DOCUMENTS]),
    )
    file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.create(createProductDto, file, req.user.id);
  }

  @ApiAcceptedResponse({
    description: 'Lista de productos obtenida correctamente.',
    type: [CreateProductDto],
  })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiAcceptedResponse({
    description: 'Lista de productos de un proyecto.',
  })
  @Get('/by-project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.productsService.findByProject(projectId);
  }

  @ApiAcceptedResponse({
    description: 'Producto obtenido correctamente.',
    type: CreateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('/by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.productsService.findByUser(userId);
  }

  @ApiConsumes('multipart/form-data')
  @ApiAcceptedResponse({
    description: 'Producto actualizado correctamente.',
    type: UpdateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(
      new FileValidationPipe(5 * 1024 * 1024, [...FILE_MIME_TYPES.DOCUMENTS]),
    )
    file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id, file);
  }

  @ApiAcceptedResponse({
    description: 'Producto eliminado correctamente.',
    type: UpdateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
