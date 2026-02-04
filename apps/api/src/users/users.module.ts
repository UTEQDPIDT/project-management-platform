import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { UserResourceInterceptor } from './interceptors/user-resource.interceptor';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => CaslModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserResourceInterceptor],
  exports: [UsersService],
})
export class UsersModule {}
