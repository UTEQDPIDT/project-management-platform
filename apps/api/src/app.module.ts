import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { SeedModule } from './seed/seed.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { SeedService } from './seed/seed.service';
import { FilesModule } from './files/files.module';
import { ProductsModule } from './products/products.module';
import { ActivitiesModule } from './activities/activities.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Permite acceso a las variables de entorno en toda la app
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI),

    AuthModule,

    UsersModule,

    TeamsModule,

    SeedModule,

    CatalogsModule,
    
    FilesModule,

    ProductsModule,

    ActivitiesModule,

    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.runSeed(process.env.SEED_PASSWORD);
  }
}
