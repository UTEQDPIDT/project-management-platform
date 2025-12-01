import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Division, DivisionSchema } from '../schemas/division.schema';
import { EducationalProgram, EducationalProgramSchema } from '../schemas/educational-program.schema';
import { ProductCategory, ProductCategorySchema } from '../schemas/product-category.schema';
import { ProductSubcategory, ProductSubcategorySchema } from '../schemas/product-subcategory.schema';
import { PNDpriority, PNDprioritySchema } from '../schemas/pnd-priority.schema';
import { ThemedImpactArea, ThemedImpactAreaSchema } from '../schemas/themed-impact-area.schema';
import { KnowledgeArea, KnowledgeAreaSchema } from '../schemas/knowledge-area.schema';
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
  controllers: [SeedController],
  providers: [SeedService],

})
export class SeedModule {}
