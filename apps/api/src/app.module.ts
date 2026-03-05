import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { EventsModule } from './events/events.module';
import { CaslModule } from './casl/casl.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Permite acceso a las variables de entorno en toda la app
      // En producción carga .env.production, en desarrollo solo .env.development
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env.production']
          : ['.env.development'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 30,
        },
      ],
    }),

    MongooseModule.forRootAsync({
      // Inyectamos ConfigService para leer las variables de forma limpia
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const user = configService.get<string>('MONGO_USER');
        const pass = configService.get<string>('MONGO_PASSWORD');
        const host = configService.get<string>('MONGO_HOST') || 'mongodb:27017';
        const db =
          configService.get<string>('MONGO_DB_NAME') || 'uteq_prep_database';

        // Si no hay usuario (caso de desarrollo local típico), usamos URI simple
        if (!isProduction || !user || !pass) {
          return {
            uri: `mongodb://${host}/${db}?replicaSet=rs0`,
          };
        }

        // Si hay credenciales (Producción), codificamos y añadimos parámetros de ReplicaSet
        const safeUser = encodeURIComponent(user);
        const safePass = encodeURIComponent(pass);

        return {
          uri: `mongodb://${safeUser}:${safePass}@${host}/${db}?replicaSet=rs0&authSource=admin`,
        };
      },
    }),

    AuthModule,

    UsersModule,

    TeamsModule,

    SeedModule,

    CatalogsModule,

    FilesModule,

    ProductsModule,

    ActivitiesModule,

    ProjectsModule,

    EventsModule,

    CaslModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.runSeed(process.env.SEED_PASSWORD);
  }
}
