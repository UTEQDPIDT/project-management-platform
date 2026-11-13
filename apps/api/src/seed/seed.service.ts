import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Schemas
import { User } from '../schemas/user.schema';
import { Division } from '../schemas/division.schema.seed';
import { EducationalProgram } from '../schemas/educational-program.schema.seed';
import { ProductCategory } from '../schemas/product-category.schema.seed';
import { ProductSubcategory } from '../schemas/product-subcategory.schema.seed';
import { KnowledgeArea } from '../schemas/knowledge-area.schema.seed';
import { ThemedImpactArea } from '../schemas/themed-impact-area.schema';
import { PNDpriority } from '../schemas/pnd-priority.schema.seed';
import { DevelopmentLine } from '../schemas/development-line.schema.seed';
import { DevelopmentLineSubcategory } from '../schemas/development-line-subcategory.schema.seed';
import { SustainabilityGoal } from '../schemas/sustainability-goal.schema.seed';
import { Programa } from '../schemas/project-programs.seed';

// Static data
import {
  divisionsList,
  educationalProgramsList,
  productCategoryList,
  productSubcategoryList,
  knowledgeAreaList,
  themedImpactAreaList,
  PNDprioritiesList,
  developmentLinesList,
  developmentLineSubcategoriesList,
  sustainabilityGoalsList,
  initialUsers,
  ProgramaList,
} from './seed-data/static-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Division.name)
    private readonly divisionModel: Model<Division>,

    @InjectModel(EducationalProgram.name)
    private readonly educationalProgramModel: Model<EducationalProgram>,

    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategory>,

    @InjectModel(ProductSubcategory.name)
    private readonly productSubcategoryModel: Model<ProductSubcategory>,

    @InjectModel(KnowledgeArea.name)
    private readonly knowledgeAreaModel: Model<KnowledgeArea>,

    @InjectModel(ThemedImpactArea.name)
    private readonly themedImpactAreaModel: Model<ThemedImpactArea>,

    @InjectModel(PNDpriority.name)
    private readonly pndPriorityModel: Model<PNDpriority>,

    @InjectModel(DevelopmentLine.name)
    private readonly developmentLineModel: Model<DevelopmentLine>,

    @InjectModel(DevelopmentLineSubcategory.name)
    private readonly developmentLineSubcategoryModel: Model<DevelopmentLineSubcategory>,

    @InjectModel(SustainabilityGoal.name)
    private readonly sustainabilityGoalModel: Model<SustainabilityGoal>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Programa.name)
    private readonly programaModel: Model<Programa>,
  ) {}

  private async seedCollection(
    model: Model<any>,
    list: Record<string, any>[],
    key: string,
  ) {
    await Promise.all(
      list.map(async (item) => {
        try {
          await model.updateOne(
            { [key]: item[key] },
            { $setOnInsert: item },
            { upsert: true },
          );
        } catch (err: any) {
          if (err.code !== 11000) throw err;
        }
      }),
    );
  }

  private async seedDevelopmentLineSubcategories() {
    const lines = await this.developmentLineModel.find({
      name: {
        $in: [
          ...new Set(
            developmentLineSubcategoriesList.map((s) => s.developmentLineName),
          ),
        ],
      },
    });
    const lineIdByName = new Map(lines.map((l) => [l.name, l._id]));

    await Promise.all(
      developmentLineSubcategoriesList.map(
        async ({ name, developmentLineName }) => {
          const developmentLine = lineIdByName.get(developmentLineName);

          if (!developmentLine) {
            throw new Error(
              `Línea de desarrollo no encontrada para la subcategoría "${name}": "${developmentLineName}"`,
            );
          }

          await this.developmentLineSubcategoryModel.updateOne(
            { name, developmentLine },
            { $setOnInsert: { name, developmentLine } },
            { upsert: true },
          );
        },
      ),
    );
  }

  private async seedUsers(users: Partial<CreateUserDto>[]) {
    for (const user of users) {
      const exists = await this.userModel.findOne({ email: user.email });

      if (exists) continue; // ya existe, lo ignoramos

      await this.userModel.create({
        ...user,
      });
    }
  }

  async runSeed(password: string) {
    if (password !== process.env.SEED_PASSWORD)
      throw new UnauthorizedException('Contraseña incorrecta.');

    await this.seedCollection(this.divisionModel, divisionsList, 'name');

    await this.seedCollection(
      this.educationalProgramModel,
      educationalProgramsList,
      'name',
    );

    await this.seedCollection(
      this.productCategoryModel,
      productCategoryList,
      'name',
    );

    await this.seedCollection(
      this.productSubcategoryModel,
      productSubcategoryList,
      'name',
    );

    await this.seedCollection(
      this.knowledgeAreaModel,
      knowledgeAreaList,
      'name',
    );

    await this.seedCollection(
      this.themedImpactAreaModel,
      themedImpactAreaList,
      'name',
    );

    await this.seedCollection(this.pndPriorityModel, PNDprioritiesList, 'name');

    await this.seedCollection(
      this.developmentLineModel,
      developmentLinesList,
      'name',
    );

    await this.seedDevelopmentLineSubcategories();

    await this.seedCollection(
      this.sustainabilityGoalModel,
      sustainabilityGoalsList,
      'name',
    );

    await this.seedCollection(
      this.programaModel,
      ProgramaList,
      'name',
    );

    await this.seedUsers(initialUsers);

    console.log('Seed data has been populated successfully.');
  }
}
