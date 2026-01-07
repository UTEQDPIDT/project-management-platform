import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { User } from '../schemas/user.schema';
// import { CreateUserDto } from '../users/dto/create-user.dto';
// import * as bcrypt from 'bcrypt';

// Schemas
import { Division } from '../schemas/division.schema.seed';
import { EducationalProgram } from '../schemas/educational-program.schema.seed';
import { ProductCategory } from '../schemas/product-category.schema.seed';
import { ProductSubcategory } from '../schemas/product-subcategory.schema.seed';
import { KnowledgeArea } from '../schemas/knowledge-area.schema.seed';
import { ThemedImpactArea } from '../schemas/themed-impact-area.schema';
import { PNDpriority } from '../schemas/pnd-priority.schema.seed';
import { DevelopmentLine } from '../schemas/development-line.schema.seed';
import { SustainabilityGoal } from '../schemas/sustainability-goal.schema.seed';

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
  sustainabilityGoalsList,
  //initialUsers,
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

    @InjectModel(SustainabilityGoal.name)
    private readonly sustainabilityGoalModel: Model<SustainabilityGoal>,

    @InjectModel('User')
    private readonly userModel: Model<any>,
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

  //   private async seedUsers(users: Partial<CreateUserDto>[]) {
  //   for (const user of users) {

  //     const exists = await this.userModel.findOne({ email: user.email });

  //     if (exists) continue; // ya existe, lo ignoramos

  //     const hashedPassword = await bcrypt.hash('Cambiar123*', 10);

  //     await this.userModel.create({
  //       ...user,
  //       password: hashedPassword,
  //       verified: true, // opcional
  //     });
  //   }
  // }

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

    await this.seedCollection(
      this.sustainabilityGoalModel,
      sustainabilityGoalsList,
      'name',
    );

    //await this.seedUsers(initialUsers);

    console.log('Seed data has been populated successfully.');
  }

  async fixMatriculaIndex(password: string) {
    if (password !== process.env.SEED_PASSWORD)
      throw new UnauthorizedException('Contraseña incorrecta.');

    try {
      // 1. Remove all null/undefined matricula and employeeNumber values
      await this.userModel.updateMany(
        { matricula: null },
        { $unset: { matricula: '' } },
      );

      await this.userModel.updateMany(
        { employeeNumber: null },
        { $unset: { employeeNumber: '' } },
      );

      // 2. Drop the existing indexes if they exist
      const indexesToDrop = ['matricula_1', 'employeeNumber_1'];

      for (const indexName of indexesToDrop) {
        try {
          await this.userModel.collection.dropIndex(indexName);
          console.log(`Dropped existing ${indexName} index`);
        } catch (err) {
          console.log(`No existing ${indexName} index to drop`);
        }
      }

      // 3. Recreate the indexes as sparse and unique
      await this.userModel.collection.createIndex(
        { matricula: 1 },
        { unique: true, sparse: true },
      );

      await this.userModel.collection.createIndex(
        { employeeNumber: 1 },
        { unique: true, sparse: true },
      );

      console.log(
        'Matricula and employeeNumber indexes fixed successfully.',
      );
      return {
        success: true,
        message:
          'Índices de matrícula y número de empleado reparados correctamente. Usuarios con valores null actualizados.',
      };
    } catch (error) {
      console.error('Error fixing indexes:', error);
      throw error;
    }
  }
}
