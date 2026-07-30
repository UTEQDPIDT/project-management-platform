import { 
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UploadedFile,
    UseInterceptors,
    Req,
} from '@nestjs/common';

import { StandaloneProductsService } from './standalone-products.service';
import { CreateStandaloneProductDto } from './dto/create-standalone-product.dto';
import { UpdateStandaloneProductDto } from './dto/update-standalone-product.dto';

import { FileValidationPipe } from '../common/pipes';
import { FILE_MIME_TYPES } from '../common/constants';
import { FileInterceptor } from '@nestjs/platform-express';

import {
    ApiAcceptedResponse,
    ApiBadRequestResponse,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@repo/types';

type AuthenticatedRequest = {
    user: {
        id: string;
        role: UserRole;
    };
};

@ApiTags('Standalone Products')
@Controller('standalone-products')
export class StandaloneProductsController {

    constructor(private readonly standaloneProductsService: StandaloneProductsService) {}

    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({
        description: 'Producto independiente creado correctamente',
        type: [CreateStandaloneProductDto],
    })
    @ApiBadRequestResponse({
        description: 'Ocurrió un error al crear el producto independiente',
    })
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    create(
        @Body() createStandaloneProductDto: CreateStandaloneProductDto,
        @UploadedFile(
            new FileValidationPipe(5 * 1024 * 1024, [...FILE_MIME_TYPES.DOCUMENTS]),
        )
        file: Express.Multer.File,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.standaloneProductsService.create(createStandaloneProductDto, file, req.user.id);
    }

    @ApiAcceptedResponse({
        description: 'Lista de productos independientes obtenida correctamente',
        type: [CreateStandaloneProductDto],
    })
    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        return this.standaloneProductsService.findAllVisibleTo(
            req.user.id,
            req.user.role,
        );
    }

    @ApiAcceptedResponse({
        description: 'Producto independiente obtenido correctamente.',
        type: CreateStandaloneProductDto,
    })
    @ApiNotFoundResponse({ description: 'No se encontro el producto independiente.' })
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.standaloneProductsService.findOne(
            id,
            req.user.id,
            req.user.role,
        );
    }

    @ApiAcceptedResponse({
        description: 'Lista de productos independientes por usuario obtenida correctamente.',
        type: [CreateStandaloneProductDto],
    })
    @Get('/by-user/:userId')
    findByUser(@Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
        return this.standaloneProductsService.findByUserVisibleTo(
            userId,
            req.user.id,
            req.user.role,
        );
    }

    @ApiConsumes('multipart/form-data')
    @ApiAcceptedResponse({
        description: 'Producto independiente actualizado correctamente.',
        type: UpdateStandaloneProductDto,
    })
    @ApiNotFoundResponse({ description: 'No se encontro el producto independiente.' })
    @UseInterceptors(FileInterceptor('file'))
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateStandaloneProductDto: UpdateStandaloneProductDto,
        @UploadedFile(
            new FileValidationPipe(5 * 1024 * 1024, [...FILE_MIME_TYPES.DOCUMENTS], false),
        )
        file: Express.Multer.File,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.standaloneProductsService.update(
            id,
            updateStandaloneProductDto,
            req.user.id,
            req.user.role,
            file,
        );
    }

    @ApiAcceptedResponse({
        description: 'Producto independiente eliminado correctamente.',
        type: UpdateStandaloneProductDto,
    })
    @ApiNotFoundResponse({ description: 'No se encontro el producto independiente.' })
    @ApiUnauthorizedResponse({ description: 'No autorizado' })
    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        await this.standaloneProductsService.remove(id, req.user.id, req.user.role);
    }

}
