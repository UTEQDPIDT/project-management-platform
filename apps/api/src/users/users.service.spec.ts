import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { BadRequestException } from '@nestjs/common';
import { UserRole, UserType } from '@repo/types';

describe('UsersService', () => {
  let service: UsersService;

  const savedUserData: Record<string, unknown>[] = [];
  const userModelMock = Object.assign(jest.fn().mockImplementation((data: Record<string, unknown>) => {
    savedUserData.push(data);
    return { _id: 'user-1', save: jest.fn().mockResolvedValue(undefined) };
  }), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    savedUserData.length = 0;
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

  it('classifies new Google and password users and honors an explicit type', async () => {
    await service.create({
      givenName: 'Ana', familyName: 'Ruiz', email: 'Ana@uteq.edu.mx',
      role: UserRole.USER,
    });
    await service.createWithPassword({
      givenName: 'Luis', familyName: 'Ruiz', email: '123@uteq.edu.mx',
      passwordHash: 'hash',
    });
    await service.create({
      givenName: 'Ana', familyName: 'Ruiz', email: 'ana@uteq.edu.mx',
      role: UserRole.USER, type: UserType.ADMINISTRATIVO,
    });
    expect(savedUserData.map((user) => user.type)).toEqual([
      UserType.MAESTRO, UserType.ESTUDIANTE, UserType.ADMINISTRATIVO,
    ]);
  });

  it('rejects unclassifiable emails instead of silently assigning a type', async () => {
    await expect(service.createWithPassword({
      givenName: 'Ana', familyName: 'Ruiz', email: '_ana@uteq.edu.mx',
      passwordHash: 'hash',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(savedUserData).toHaveLength(0);
  });

  it('saves and clears an optional profile title', async () => {
    userModelMock.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'user-1' }),
    });
    await service.update('user-1', { title: 'Dra.' });
    await service.update('user-1', { title: '' });
    expect(userModelMock.findByIdAndUpdate).toHaveBeenNthCalledWith(
      1, 'user-1', { $set: { title: 'Dra.' } }, { new: true },
    );
    expect(userModelMock.findByIdAndUpdate).toHaveBeenNthCalledWith(
      2, 'user-1', { $set: { title: '' } }, { new: true },
    );
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
