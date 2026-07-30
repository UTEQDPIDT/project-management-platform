import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RecaptchaService } from './recaptcha.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    refreshToken: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    registerUser: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    initializePassword: jest.fn(),
    signOut: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const recaptchaServiceMock = {
    verifyTokenOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: RecaptchaService, useValue: recaptchaServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
