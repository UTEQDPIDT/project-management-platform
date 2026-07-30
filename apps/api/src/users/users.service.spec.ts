import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@repo/types';

describe('UsersService', () => {
  let service: UsersService;

  const userModelMock = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModelMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent demoting the last admin', async () => {
    userModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ role: UserRole.ADMIN }),
      }),
    });
    userModelMock.countDocuments.mockResolvedValue(1);

    await expect(
      service.updateAccess('user-1', { role: UserRole.USER }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should allow demoting an admin when another admin exists', async () => {
    userModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ role: UserRole.ADMIN }),
      }),
    });
    userModelMock.countDocuments.mockResolvedValue(2);
    userModelMock.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'user-1', role: UserRole.USER }),
    });

    await expect(
      service.updateAccess('user-1', { role: UserRole.USER }),
    ).resolves.toEqual({ id: 'user-1', message: 'User access updated successfully' });
  });
});
