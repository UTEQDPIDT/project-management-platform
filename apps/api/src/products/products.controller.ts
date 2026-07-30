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
import { UserRole } from '@repo/types';

type AuthenticatedRequest = {
  user: {
    id: string;
    role: UserRole;
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
    return this.productsService.create(
      createProductDto,
      file,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({
    description: 'Lista de productos obtenida correctamente.',
    type: [CreateProductDto],
  })
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.productsService.findAllVisibleTo(req.user.id, req.user.role);
  }

  @ApiAcceptedResponse({
    description: 'Lista de productos de un proyecto.',
  })
  @Get('/by-project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.findByProjectVisibleTo(
      projectId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({
    description: 'Producto obtenido correctamente.',
    type: CreateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.productsService.findOneVisibleTo(id, req.user.id, req.user.role);
  }

  @Get('/by-user/:userId')
  findByUser(@Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
    return this.productsService.findByUserVisibleTo(
      userId,
      req.user.id,
      req.user.role,
    );
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
    return this.productsService.update(
      id,
      updateProductDto,
      req.user.id,
      req.user.role,
      file,
    );
  }

  @ApiAcceptedResponse({
    description: 'Producto eliminado correctamente.',
    type: UpdateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.productsService.remove(id, req.user.id, req.user.role);
  }
}
