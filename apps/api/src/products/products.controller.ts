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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiCreatedResponse({
    description: 'Producto creado correctamente.',
    type: CreateProductDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.productsService.create(createProductDto, req.user.id);
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
    description: 'Producto obtenido correctamente.',
    type: CreateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiAcceptedResponse({
    description: 'Productp actualizado correctamente.',
    type: UpdateProductDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiAcceptedResponse({ description: 'Producto eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro el producto.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
