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
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }
}
