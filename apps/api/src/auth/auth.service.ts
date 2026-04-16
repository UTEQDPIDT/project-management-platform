import { Inject, Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/jwt-payload';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { UserRole } from '@repo/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private pepperPassword(password: string): string {
    const pepper = this.configService.get<string>('PASSWORD_PEPPER', '');
    return password + pepper;
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async hashPassword(password: string): Promise<string> {
    const pepperedPassword = this.pepperPassword(password);
    return argon2.hash(pepperedPassword);
  }

  async login(userId: string, role: UserRole) {
    const { accessToken, refreshToken } = await this.generateTokens(
      userId,
      role,
    );
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      _id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string, role: UserRole) {
    const payload: AuthJwtPayload = { sub: userId, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string, role: UserRole) {
    const { accessToken, refreshToken } = await this.generateTokens(
      userId,
      role,
    );
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      _id: userId,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    // extract user form db
    const user = await this.userService.findOne(userId);

    // check if user doesn't exists or doesn't have a hashed refresh token
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // compare the given refresh token to the hased token
    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    // prevent access
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return { _id: userId, role: user.role };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const normalizedEmail = this.normalizeEmail(googleUser.email);
    const user = await this.userService.findByEmail(normalizedEmail);
    if (user) return user;
    return await this.userService.create({
      ...googleUser,
      email: normalizedEmail,
    });
  }

  async validateUser(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userService.findByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const pepperedPassword = this.pepperPassword(password);
    const passwordMatches = await argon2.verify(user.passwordHash, pepperedPassword);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async registerUser(payload: {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = this.normalizeEmail(payload.email);

  const existingUser = await this.userService.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new BadRequestException('User with this email already exists');
  }

  const passwordHash = await this.hashPassword(payload.password);

  return this.userService.createWithPassword({
    givenName: payload.givenName,
    familyName: payload.familyName,
    email: normalizedEmail,
    passwordHash,
  });
}

  async signOut(userId: string) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }
}
