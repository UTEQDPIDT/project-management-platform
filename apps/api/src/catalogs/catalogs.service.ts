import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Division } from '../schemas/division.schema.seed';
import { EducationalProgram } from '../schemas/educational-program.schema.seed';
import { ProductCategory } from '../schemas/product-category.schema.seed';
import { ProductSubcategory } from '../schemas/product-subcategory.schema.seed';
import { KnowledgeArea } from '../schemas/knowledge-area.schema.seed';
import { ThemedImpactArea } from '../schemas/themed-impact-area.schema';
import { PNDpriority } from '../schemas/pnd-priority.schema.seed';
import { DevelopmentLine } from '../schemas/development-line.schema.seed';
import { SustainabilityGoal } from '../schemas/sustainability-goal.schema.seed';
import { Programa } from '../schemas/project-programs.seed';

@Injectable()
export class CatalogsService {
    constructor(
        @InjectModel(Division.name)
        private divisionModel: Model<Division>,

        @InjectModel(EducationalProgram.name)
        private educationalProgramModel: Model<EducationalProgram>,

        @InjectModel(ProductCategory.name)
        private productCategoryModel: Model<ProductCategory>,

        @InjectModel(ProductSubcategory.name)
        private productSubcategoryModel: Model<ProductSubcategory>,

        @InjectModel(KnowledgeArea.name)
        private knowledgeAreaModel: Model<KnowledgeArea>,

        @InjectModel(ThemedImpactArea.name)
        private themedImpactAreaModel: Model<ThemedImpactArea>,

        @InjectModel(PNDpriority.name)
        private pndPriorityModel: Model<PNDpriority>,

        @InjectModel(DevelopmentLine.name)
        private developmentLineModel: Model<DevelopmentLine>,

        @InjectModel(SustainabilityGoal.name)
        private sustainabilityGoalModel: Model<SustainabilityGoal>,

        @InjectModel(Programa.name)
        private projectProgramModel: Model<Programa>,
    ) {}

    private async getAll(model: Model<any>) {
        return model.find().sort({ _id: 1 });
    }

    private async create(model: Model<any>, fieldName: string, value: string) {
        try {
            if (!value || typeof value !== 'string') {
                throw new BadRequestException('El valor enviado es inválido.');
            }

            const normalizedValue = value.trim();

            const exists = await model.findOne({ [fieldName]: normalizedValue });
            if (exists) {
                throw new ConflictException(`El valor "${normalizedValue}" ya existe en ${model.modelName}.`);
            }

            const created = await model.create({ [fieldName]: normalizedValue });
            return created;

        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }

            console.error('Error al crear registro:', error);
            throw new InternalServerErrorException('Error interno al crear el registro.');
        }
    }

    private async remove(model: Model<any>, id: string) {
        
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid ID format: "${id}"`);
            }

            const exists = await model.findById(id);
            if (!exists) {
                throw new NotFoundException(`Item with ID "${id}" not found.`);
            }

            const deleted = await model.findByIdAndDelete(id);

            return {
                message: `Item with ID "${id}" has been deleted successfully.`,
                deleted,
            }
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error al eliminar registro:', error);
            throw new InternalServerErrorException('Error interno al eliminar el registro.');
        }
    }

    //GET methods
    getDivisions() { 
        return this.getAll(this.divisionModel); 
    }
    getEducationalPrograms() { 
        return this.getAll(this.educationalProgramModel); 
    }
    getProductCategories() { 
        return this.getAll(this.productCategoryModel); 
    }
    getProductSubcategories() { 
        return this.getAll(this.productSubcategoryModel); 
    }
    getKnowledgeAreas() { 
        return this.getAll(this.knowledgeAreaModel); 
    }
    getThemedImpactAreas() { 
        return this.getAll(this.themedImpactAreaModel); 
    }
    getPndPriorities() { 
        return this.getAll(this.pndPriorityModel); 
    }
    getDevelopmentLines() { 
        return this.getAll(this.developmentLineModel); 
    }
    getSustainabilityGoals() { 
        return this.getAll(this.sustainabilityGoalModel); 
    }
    getProjectPrograms() { 
        return this.getAll(this.projectProgramModel); 
    }

    //POST methods (agregar nuevos)
    addDivision(value: string) { 
        return this.create(this.divisionModel, 'name', value); 
    }
    addEducationalProgram(value: string) { 
        return this.create(this.educationalProgramModel, 'name', value); 
    }
    addProductCategory(value: string) { 
        return this.create(this.productCategoryModel, 'name', value); 
    }
    addProductSubcategory(value: string) { 
        return this.create(this.productSubcategoryModel, 'name', value); 
    }
    addKnowledgeArea(value: string) { 
        return this.create(this.knowledgeAreaModel, 'name', value); 
    }
    addThemedImpactArea(value: string) { 
        return this.create(this.themedImpactAreaModel, 'themedImpactArea', value); 
    }
    addPndPriority(value: string) { 
        return this.create(this.pndPriorityModel, 'name', value); 
    }
    addDevelopmentLine(value: string) { 
        return this.create(this.developmentLineModel, 'name', value); 
    }
    addSustainabilityGoal(value: string) { 
        return this.create(this.sustainabilityGoalModel, 'name', value); 
    }
    addProjectProgram(value: string) { 
        return this.create(this.projectProgramModel, 'name', value); 
    }

    //DELETE methods (eliminar por ID)
    deleteDivision(id: string) { 
        return this.remove(this.divisionModel, id); 
    }
    deleteEducationalProgram(id: string) { 
        return this.remove(this.educationalProgramModel, id); 
    }
    deleteProductCategory(id: string) { 
        return this.remove(this.productCategoryModel, id); 
    }
    deleteProductSubcategory(id: string) { 
        return this.remove(this.productSubcategoryModel, id); 
    }
    deleteKnowledgeArea(id: string) { 
        return this.remove(this.knowledgeAreaModel, id); 
    }
    deleteThemedImpactArea(id: string) { 
        return this.remove(this.themedImpactAreaModel, id); 
    }
    deletePndPriority(id: string) { 
        return this.remove(this.pndPriorityModel, id); 
    }
    deleteDevelopmentLine(id: string) { 
        return this.remove(this.developmentLineModel, id); 
    }
    deleteSustainabilityGoal(id: string) { 
        return this.remove(this.sustainabilityGoalModel, id); 
    }
    deleteProjectProgram(id: string) { 
        return this.remove(this.projectProgramModel, id);
    }
}