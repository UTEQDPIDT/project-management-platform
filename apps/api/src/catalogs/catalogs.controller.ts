import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('catalogs')
export class CatalogsController {
    constructor(private readonly catalogsService: CatalogsService) {}

    // GET
    @ApiOkResponse({ description: 'Lista de divisiones obtenida correctamente.'})
    @Get('divisions')
    getDivisions() {
      return this.catalogsService.getDivisions();
    }

    @ApiOkResponse({ description: 'Lista de programas educativos obtenida correctamente.'})
    @Get('educational-programs')
    getEducationalPrograms() {
      return this.catalogsService.getEducationalPrograms();
    }

    @ApiOkResponse({ description: 'Lista de categorías de productos obtenida correctamente.'})
    @Get('product-categories')
    getProductCategories() {
      return this.catalogsService.getProductCategories();
    }

    @ApiOkResponse({ description: 'Lista de subcategorías de productos obtenida correctamente.'})
    @Get('product-subcategories')
    getProductSubcategories() {
      return this.catalogsService.getProductSubcategories();
    }

    @ApiOkResponse({ description: 'Lista de áreas de conocimiento obtenida correctamente.'})
    @Get('knowledge-areas')
    getKnowledgeAreas() {
      return this.catalogsService.getKnowledgeAreas();
    }

    @ApiOkResponse({ description: 'Lista de áreas de impacto temáticas obtenida correctamente.'})
    @Get('themed-impact-areas')
    getThemedImpactAreas() {
      return this.catalogsService.getThemedImpactAreas();
    }

    @ApiOkResponse({ description: 'Lista de prioridades del PND obtenida correctamente.'})
    @Get('pnd-priorities')
    getPndPriorities() {
      return this.catalogsService.getPndPriorities();
    }

    @ApiOkResponse({ description: 'Lista de líneas de desarrollo obtenida correctamente.'})
    @Get('development-lines')
    getDevelopmentLines() {
      return this.catalogsService.getDevelopmentLines();
    }

    @ApiOkResponse({ description: 'Lista de objetivos de sostenibilidad obtenida correctamente.'})
    @Get('sustainability-goals')
    getSustainabilityGoals() {
      return this.catalogsService.getSustainabilityGoals();
    }
    @ApiOkResponse({ description: 'Lista de programas obtenida correctamente.'})
    @Get('project-programs')
    getProjectPrograms() {
      return this.catalogsService.getProjectPrograms();
    }

    // POST (Create)
    @ApiCreatedResponse({ description: 'División agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'La división ya existe.'})
    @Post('divisions')
    addDivision(@Body('value') value: string) {
      return this.catalogsService.addDivision(value);
    }

    @ApiCreatedResponse({ description: 'Programa educativo agregado correctamente.'})
    @ApiBadRequestResponse({ description: 'El programa educativo ya existe.'})
    @Post('educational-programs')
    addEducationalProgram(@Body('value') value: string) {
      return this.catalogsService.addEducationalProgram(value);
    }

    @ApiCreatedResponse({ description: 'Categoría de producto agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'La categoría de producto ya existe.'})
    @Post('product-categories')
    addProductCategory(@Body('value') value: string) {
      return this.catalogsService.addProductCategory(value);
    }

    @ApiCreatedResponse({ description: 'Subcategoría de producto agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'La subcategoría de producto ya existe.'})
    @Post('product-subcategories')
    addProductSubcategory(@Body('value') value: string) {
      return this.catalogsService.addProductSubcategory(value);
    }

    @ApiCreatedResponse({ description: 'Área de conocimiento agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'El área de conocimiento ya existe.'})
    @Post('knowledge-areas')
    addKnowledgeArea(@Body('value') value: string) {
      return this.catalogsService.addKnowledgeArea(value);
    }

    @ApiCreatedResponse({ description: 'Área de impacto temática agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'El área de impacto temática ya existe.'})
    @Post('themed-impact-areas')
    addThemedImpactArea(@Body('value') value: string) {
      return this.catalogsService.addThemedImpactArea(value);
    }

    @ApiCreatedResponse({ description: 'Prioridad del PND agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'La prioridad del PND ya existe.'})
    @Post('pnd-priorities')
    addPndPriority(@Body('value') value: string) {
      return this.catalogsService.addPndPriority(value);
    }

    @ApiCreatedResponse({ description: 'Línea de desarrollo agregada correctamente.'})
    @ApiBadRequestResponse({ description: 'La línea de desarrollo ya existe.'})
    @Post('development-lines')
    addDevelopmentLine(@Body('value') value: string) {
      return this.catalogsService.addDevelopmentLine(value);
    }

    @ApiCreatedResponse({ description: 'Objetivo de sostenibilidad agregado correctamente.'})
    @ApiBadRequestResponse({ description: 'El objetivo de sostenibilidad ya existe.'})
    @Post('sustainability-goals')
    addSustainabilityGoal(@Body('value') value: string) {
      return this.catalogsService.addSustainabilityGoal(value);
    }

    @ApiCreatedResponse({ description: 'Programa agregado correctamente.'})
    @ApiBadRequestResponse({ description: 'El programa ya existe.'})
    @Post('project-programs')
    addProjectProgram(@Body('value') value: string) {
      return this.catalogsService.addProjectProgram(value);
    }

    // DELETE
    @ApiOkResponse({ description: 'División eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró la división.'})
    @Delete('divisions/:id')
    deleteDivision(@Param('id') id: string) {
      return this.catalogsService.deleteDivision(id);
    }

    @ApiOkResponse({ description: 'Programa educativo eliminado correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró el programa educativo.'})
    @Delete('educational-programs/:id')
    deleteEducationalProgram(@Param('id') id: string) {
      return this.catalogsService.deleteEducationalProgram(id);
    }

    @ApiOkResponse({ description: 'Categoría de producto eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró la categoría de producto.'})
    @Delete('product-categories/:id')
    deleteProductCategory(@Param('id') id: string) {
      return this.catalogsService.deleteProductCategory(id);
    }

    @ApiOkResponse({ description: 'Subcategoría de producto eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró la subcategoría de producto.'})
    @Delete('product-subcategories/:id')
    deleteProductSubcategory(@Param('id') id: string) {
      return this.catalogsService.deleteProductSubcategory(id);
    }

    @ApiOkResponse({ description: 'Área de conocimiento eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró el área de conocimiento.'})
    @Delete('knowledge-areas/:id')
    deleteKnowledgeArea(@Param('id') id: string) {
      return this.catalogsService.deleteKnowledgeArea(id);
    }

    @ApiOkResponse({ description: 'Área de impacto temática eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró el área de impacto temática.'})
    @Delete('themed-impact-areas/:id')
    deleteThemedImpactArea(@Param('id') id: string) {
      return this.catalogsService.deleteThemedImpactArea(id);
    }

    @ApiOkResponse({ description: 'Prioridad del PND eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró la prioridad del PND.'})
    @Delete('pnd-priorities/:id')
    deletePndPriority(@Param('id') id: string) {
      return this.catalogsService.deletePndPriority(id);
    }

    @ApiOkResponse({ description: 'Línea de desarrollo eliminada correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró la línea de desarrollo.'})
    @Delete('development-lines/:id')
    deleteDevelopmentLine(@Param('id') id: string) {
      return this.catalogsService.deleteDevelopmentLine(id);
    }

    @ApiOkResponse({ description: 'Objetivo de sostenibilidad eliminado correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró el objetivo de sostenibilidad.'})
    @Delete('sustainability-goals/:id')
    deleteSustainabilityGoal(@Param('id') id: string) {
      return this.catalogsService.deleteSustainabilityGoal(id);
    }

    @ApiOkResponse({ description: 'Programa eliminado correctamente.'})
    @ApiNotFoundResponse({ description: 'No se encontró el programa.'})
    @Delete('project-programs/:id')
    deleteProjectProgram(@Param('id') id: string) {
      return this.catalogsService.deleteProjectProgram(id);
    }
}