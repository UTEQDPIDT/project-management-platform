import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
