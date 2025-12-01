import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
    constructor(private readonly catalogsService: CatalogsService) {}

    // GET
    @Get('divisions')
    getDivisions() {
      return this.catalogsService.getDivisions();
    }

    @Get('educational-programs')
    getEducationalPrograms() {
      return this.catalogsService.getEducationalPrograms();
    }

    @Get('product-categories')
    getProductCategories() {
      return this.catalogsService.getProductCategories();
    }

    @Get('product-subcategories')
    getProductSubcategories() {
      return this.catalogsService.getProductSubcategories();
    }

    @Get('knowledge-areas')
    getKnowledgeAreas() {
      return this.catalogsService.getKnowledgeAreas();
    }

    @Get('themed-impact-areas')
    getThemedImpactAreas() {
      return this.catalogsService.getThemedImpactAreas();
    }

    @Get('pnd-priorities')
    getPndPriorities() {
      return this.catalogsService.getPndPriorities();
    }

    @Get('development-lines')
    getDevelopmentLines() {
      return this.catalogsService.getDevelopmentLines();
    }

    @Get('sustainability-goals')
    getSustainabilityGoals() {
      return this.catalogsService.getSustainabilityGoals();
    }

    // POST (Create)
    @Post('divisions')
    addDivision(@Body('value') value: string) {
      return this.catalogsService.addDivision(value);
    }

    @Post('educational-programs')
    addEducationalProgram(@Body('value') value: string) {
      return this.catalogsService.addEducationalProgram(value);
    }

    @Post('product-categories')
    addProductCategory(@Body('value') value: string) {
      return this.catalogsService.addProductCategory(value);
    }

    @Post('product-subcategories')
    addProductSubcategory(@Body('value') value: string) {
      return this.catalogsService.addProductSubcategory(value);
    }

    @Post('knowledge-areas')
    addKnowledgeArea(@Body('value') value: string) {
      return this.catalogsService.addKnowledgeArea(value);
    }

    @Post('themed-impact-areas')
    addThemedImpactArea(@Body('value') value: string) {
      return this.catalogsService.addThemedImpactArea(value);
    }

    @Post('pnd-priorities')
    addPndPriority(@Body('value') value: string) {
      return this.catalogsService.addPndPriority(value);
    }

    @Post('development-lines')
    addDevelopmentLine(@Body('value') value: string) {
      return this.catalogsService.addDevelopmentLine(value);
    }

    @Post('sustainability-goals')
    addSustainabilityGoal(@Body('value') value: string) {
      return this.catalogsService.addSustainabilityGoal(value);
    }

    // DELETE
    @Delete('divisions/:id')
    deleteDivision(@Param('id') id: string) {
      return this.catalogsService.deleteDivision(id);
    }

    @Delete('educational-programs/:id')
    deleteEducationalProgram(@Param('id') id: string) {
      return this.catalogsService.deleteEducationalProgram(id);
    }

    @Delete('product-categories/:id')
    deleteProductCategory(@Param('id') id: string) {
      return this.catalogsService.deleteProductCategory(id);
    }

    @Delete('product-subcategories/:id')
    deleteProductSubcategory(@Param('id') id: string) {
      return this.catalogsService.deleteProductSubcategory(id);
    }

    @Delete('knowledge-areas/:id')
    deleteKnowledgeArea(@Param('id') id: string) {
      return this.catalogsService.deleteKnowledgeArea(id);
    }

    @Delete('themed-impact-areas/:id')
    deleteThemedImpactArea(@Param('id') id: string) {
      return this.catalogsService.deleteThemedImpactArea(id);
    }

    @Delete('pnd-priorities/:id')
    deletePndPriority(@Param('id') id: string) {
      return this.catalogsService.deletePndPriority(id);
    }

    @Delete('development-lines/:id')
    deleteDevelopmentLine(@Param('id') id: string) {
      return this.catalogsService.deleteDevelopmentLine(id);
    }

    @Delete('sustainability-goals/:id')
    deleteSustainabilityGoal(@Param('id') id: string) {
      return this.catalogsService.deleteSustainabilityGoal(id);
    }
}