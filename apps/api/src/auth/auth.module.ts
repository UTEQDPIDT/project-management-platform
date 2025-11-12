import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';

@Module({
  imports: [ConfigModule.forFeature(googleOauthConfig)],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
