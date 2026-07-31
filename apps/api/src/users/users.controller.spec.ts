import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@repo/types';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    resolveEmails: jest.fn(),
    findOne: jest.fn(),
    findAllForTeamPicker: jest.fn(),
    update: jest.fn(),
    updateAccess: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should reject self role changes in updateAccess', async () => {
    usersServiceMock.findOne.mockResolvedValue({
      _id: 'admin-1',
      role: UserRole.ADMIN,
      canCloseProject: true,
    });

    await expect(
      controller.updateAccess(
        'admin-1',
        { role: UserRole.USER },
        { user: { id: 'admin-1', role: UserRole.ADMIN } },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject access changes when admin lacks canCloseProject', async () => {
    usersServiceMock.findOne.mockResolvedValue({
      _id: 'admin-1',
      role: UserRole.ADMIN,
      canCloseProject: false,
    });

    await expect(
      controller.updateAccess(
        'user-2',
        { role: UserRole.USER },
        { user: { id: 'admin-1', role: UserRole.ADMIN } },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
