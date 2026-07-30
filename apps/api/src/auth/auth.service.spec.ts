import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import refreshJwtConfig from './config/refresh-jwt.config';

describe('AuthService', () => {
  let service: AuthService;

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
});
