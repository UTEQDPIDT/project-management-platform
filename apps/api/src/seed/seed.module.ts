import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Division, DivisionSchema } from '../schemas/division.schema.seed';
import { EducationalProgram, EducationalProgramSchema } from '../schemas/educational-program.schema.seed';
import { ProductCategory, ProductCategorySchema } from '../schemas/product-category.schema.seed';
import { ProductSubcategory, ProductSubcategorySchema } from '../schemas/product-subcategory.schema.seed';
import { PNDpriority, PNDprioritySchema } from '../schemas/pnd-priority.schema.seed';
import { ThemedImpactArea, ThemedImpactAreaSchema } from '../schemas/themed-impact-area.schema';
import { KnowledgeArea, KnowledgeAreaSchema } from '../schemas/knowledge-area.schema.seed';
import { DevelopmentLine, DevelopmentLineSchema } from '../schemas/development-line.schema.seed';
import { SustainabilityGoal, SustainabilityGoalSchema } from '../schemas/sustainability-goal.schema.seed';

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
  exports: [SeedService],
})
export class SeedModule {}
