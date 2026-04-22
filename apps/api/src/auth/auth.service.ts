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
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
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

  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userService.findByEmail(normalizedEmail);

    if (!user) {
      return {
        message:
          'Si el correo existe, enviaremos instrucciones para restablecer la contraseña',
      };
    }

    const rawToken = randomBytes(32).toString('hex');
    const passwordResetTokenHash = this.hashResetToken(rawToken);
    const passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.userService.setPasswordResetToken(user._id.toString(), {
      passwordResetTokenHash,
      passwordResetExpiresAt,
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    try {
      await this.emailService.sendPasswordReset(normalizedEmail, resetUrl);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email for ${normalizedEmail}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      message:
        'Si el correo existe, enviaremos instrucciones para restablecer la contraseña',
    };
  }

  async resetPassword(payload: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const normalizedEmail = this.normalizeEmail(payload.email);
    const user = await this.userService.findByEmail(normalizedEmail);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetUsedAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const receivedTokenHash = this.hashResetToken(payload.token);

    if (receivedTokenHash !== user.passwordResetTokenHash) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.hashPassword(payload.newPassword);

    await this.userService.completePasswordReset(user._id.toString(), {
      passwordHash,
      passwordResetUsedAt: new Date(),
    });

    await this.userService.updateHashedRefreshToken(user._id.toString(), null);

    return {
      message: 'Password reset successfully',
    };
  }

async initializePassword(email: string) {
  const normalizedEmail = this.normalizeEmail(email);
  const user = await this.userService.findByEmail(normalizedEmail);

  const genericResponse = {
    message:
      'Si el correo existe y requiere activación, enviaremos instrucciones para establecer la contraseña',
  };

  if (!user) {
    return genericResponse;
  }

  if (user.passwordHash) {
    return genericResponse;
  }

  const hasActiveToken =
    user.passwordResetTokenHash &&
    user.passwordResetExpiresAt &&
    user.passwordResetExpiresAt.getTime() > Date.now() &&
    !user.passwordResetUsedAt;

  if (hasActiveToken) {
    return genericResponse;
  }

  const rawToken = randomBytes(32).toString('hex');
  const passwordResetTokenHash = this.hashResetToken(rawToken);
  const passwordResetExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await this.userService.setPasswordResetToken(user._id.toString(), {
    passwordResetTokenHash,
    passwordResetExpiresAt,
  });

  const frontendUrl = this.configService.get<string>('FRONTEND_URL', '');
  const setupUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  try {
    await this.emailService.sendInitialPasswordSetup(normalizedEmail, setupUrl);
  } catch (error) {
    this.logger.error(
      `Failed to send initial password setup email for ${normalizedEmail}`,
      error instanceof Error ? error.stack : String(error),
    );
  }

  return genericResponse;
}

  async signOut(userId: string) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }
}
