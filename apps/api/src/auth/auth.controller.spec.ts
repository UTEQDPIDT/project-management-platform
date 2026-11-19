import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RecaptchaService } from './recaptcha.service';
import { UserRole } from '@repo/types';

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
    jest.clearAllMocks();
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

  it('includes the profile reminder on password login and registration redirects', async () => {
    const user = { _id: 'user-1', role: UserRole.USER };
    authServiceMock.validateUser.mockResolvedValue(user);
    authServiceMock.registerUser.mockResolvedValue(user);
    authServiceMock.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    const res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = { ip: '127.0.0.1' };

    await controller.mockLogin(
      { email: 'user@uteq.edu.mx', password: 'password', recaptchaToken: 'token' },
      request as Parameters<AuthController['mockLogin']>[1],
      res as unknown as Parameters<AuthController['mockLogin']>[2],
    );
    expect(res.json).toHaveBeenLastCalledWith({ redirectUrl: '/user/inicio?profileReminder=1' });
    await controller.mockRegister(
      { givenName: 'Ana', familyName: 'Ruiz', email: 'user@uteq.edu.mx', password: 'password', recaptchaToken: 'token' },
      request as Parameters<AuthController['mockRegister']>[1],
      res as unknown as Parameters<AuthController['mockRegister']>[2],
    );
    expect(res.json).toHaveBeenLastCalledWith({ redirectUrl: '/user/inicio?profileReminder=1' });
  });

  it('includes the profile reminder in the Google admin redirect', async () => {
    authServiceMock.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    const res = { cookie: jest.fn(), redirect: jest.fn() };
    const req = { user: { _id: 'user-1', role: UserRole.ADMIN } };

    await controller.googleCallback(
      req as Parameters<AuthController['googleCallback']>[0],
      res as unknown as Parameters<AuthController['googleCallback']>[1],
    );
    expect(res.redirect).toHaveBeenCalledWith(
      `${process.env.FRONTEND_URL}/admin/inicio?profileReminder=1`,
    );
  });
});
