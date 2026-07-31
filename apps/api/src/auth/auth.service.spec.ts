import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import refreshJwtConfig from './config/refresh-jwt.config';

describe('AuthService', () => {
  let service: AuthService;
  const configValues: Record<string, string> = {
    FORGOT_PASSWORD_EMAIL_RATE_LIMIT_WINDOW_SECONDS: '300',
    FORGOT_PASSWORD_EMAIL_RATE_LIMIT_MAX_ATTEMPTS: '5',
    FORGOT_PASSWORD_COOLDOWN_SECONDS: '60',
    PASSWORD_RESET_TOKEN_TTL_MINUTES: '15',
    FRONTEND_URL: 'http://localhost:3000',
  };

  const usersServiceMock = {
    updateHashedRefreshToken: jest.fn(),
    findOneWithSensitiveById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    findByEmailWithSensitive: jest.fn(),
    createWithPassword: jest.fn(),
    setPasswordResetToken: jest.fn(),
    completePasswordReset: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const emailServiceMock = {
    sendPasswordReset: jest.fn(),
    sendInitialPasswordSetup: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    configServiceMock.get.mockImplementation(
      (key: string, fallback?: string) => configValues[key] ?? fallback,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: refreshJwtConfig.KEY, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return generic response when email does not exist', async () => {
    usersServiceMock.findByEmailWithSensitive.mockResolvedValue(null);

    const result = await service.forgotPassword('unknown@uteq.edu.mx', '127.0.0.1');

    expect(result).toEqual({
      message:
        'Si el correo existe, enviaremos instrucciones para restablecer la contraseña',
    });
    expect(usersServiceMock.setPasswordResetToken).not.toHaveBeenCalled();
    expect(emailServiceMock.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('should enforce per-email rate limit on forgot-password', async () => {
    configValues.FORGOT_PASSWORD_EMAIL_RATE_LIMIT_MAX_ATTEMPTS = '1';
    usersServiceMock.findByEmailWithSensitive.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      passwordResetRequestedAt: null,
    });
    usersServiceMock.setPasswordResetToken.mockResolvedValue(undefined);
    emailServiceMock.sendPasswordReset.mockResolvedValue(undefined);

    await service.forgotPassword('user@uteq.edu.mx', '127.0.0.1');
    await service.forgotPassword('user@uteq.edu.mx', '127.0.0.1');

    expect(usersServiceMock.setPasswordResetToken).toHaveBeenCalledTimes(1);
    expect(emailServiceMock.sendPasswordReset).toHaveBeenCalledTimes(1);
  });

  it('should enforce account cooldown for forgot-password', async () => {
    configValues.FORGOT_PASSWORD_EMAIL_RATE_LIMIT_MAX_ATTEMPTS = '5';
    configValues.FORGOT_PASSWORD_COOLDOWN_SECONDS = '120';

    usersServiceMock.findByEmailWithSensitive.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      passwordResetRequestedAt: new Date(Date.now() - 30 * 1000),
    });

    const result = await service.forgotPassword('user@uteq.edu.mx', '127.0.0.1');

    expect(result).toEqual({
      message:
        'Si el correo existe, enviaremos instrucciones para restablecer la contraseña',
    });
    expect(usersServiceMock.setPasswordResetToken).not.toHaveBeenCalled();
    expect(emailServiceMock.sendPasswordReset).not.toHaveBeenCalled();
  });
});
