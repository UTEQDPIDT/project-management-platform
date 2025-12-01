import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';

import { Division, DivisionSchema } from '../schemas/division.schema';
import { EducationalProgram, EducationalProgramSchema } from '../schemas/educational-program.schema';
import { ProductCategory, ProductCategorySchema } from '../schemas/product-category.schema';
import { ProductSubcategory, ProductSubcategorySchema } from '../schemas/product-subcategory.schema';
import { KnowledgeArea, KnowledgeAreaSchema } from '../schemas/knowledge-area.schema';
import { ThemedImpactArea, ThemedImpactAreaSchema } from '../schemas/themed-impact-area.schema';
import { PNDpriority, PNDprioritySchema } from '../schemas/pnd-priority.schema';
import { DevelopmentLine, DevelopmentLineSchema } from '../schemas/development-line.schema';
import { SustainabilityGoal, SustainabilityGoalSchema } from '../schemas/sustainability-goal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Division.name, schema: DivisionSchema },
      { name: EducationalProgram.name, schema: EducationalProgramSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: ProductSubcategory.name, schema: ProductSubcategorySchema },
      { name: KnowledgeArea.name, schema: KnowledgeAreaSchema },
      { name: ThemedImpactArea.name, schema: ThemedImpactAreaSchema },
      { name: PNDpriority.name, schema: PNDprioritySchema },
      { name: DevelopmentLine.name, schema: DevelopmentLineSchema },
      { name: SustainabilityGoal.name, schema: SustainabilityGoalSchema },
    ]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
})
export class CatalogsModule {}
