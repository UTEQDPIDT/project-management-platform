import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EntityType, UserRole } from '@repo/types';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const productModelMock = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const projectModelMock = {
    findById: jest.fn(),
  };

  const filesServiceMock = {
    findFilesForEntity: jest.fn(),
    deleteFilesForResource: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = Object.create(ProductsService.prototype) as ProductsService;
    (service as unknown as { productModel: typeof productModelMock }).productModel =
      productModelMock;
    (service as unknown as { projectModel: typeof projectModelMock }).projectModel =
      projectModelMock;
    (service as unknown as { filesService: typeof filesServiceMock }).filesService =
      filesServiceMock;
  });

  it('should reject remove when actor is not owner and not admin', async () => {
    productModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        projectId: { toString: () => 'p1' },
        owner: { toString: () => 'owner-1' },
      }),
    });
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'owner-1' },
          team: { memberships: [] },
          status: 'PENDING',
          validationStatus: null,
        }),
      }),
    });

    await expect(
      service.remove('product-1', 'user-2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should allow admin remove and cleanup files', async () => {
    productModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        projectId: { toString: () => 'p1' },
        owner: { toString: () => 'owner-1' },
      }),
    });
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'owner-1' },
          team: { memberships: [] },
          status: 'PENDING',
          validationStatus: null,
        }),
      }),
    });
    filesServiceMock.findFilesForEntity.mockResolvedValue([
      {
        _id: 'f1',
        entityId: { toString: () => 'product-1' },
        entityType: EntityType.PRODUCT,
        gridFsId: { toString: () => '507f1f77bcf86cd799439011' },
      },
    ]);
    productModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'product-1' });

    const result = await service.remove('product-1', 'admin-1', UserRole.ADMIN);

    expect(result).toEqual({ message: 'Product deleted successfully' });
    expect(filesServiceMock.deleteFilesForResource).toHaveBeenCalledTimes(1);
    expect(productModelMock.findByIdAndDelete).toHaveBeenCalledWith('product-1');
  });

  it('should allow active team member to remove a project product', async () => {
    productModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        projectId: { toString: () => 'p1' },
        owner: { toString: () => 'owner-1' },
      }),
    });
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'owner-1' },
          team: {
            memberships: [
              { user: { toString: () => 'team-user' }, status: 'ACTIVE' },
            ],
          },
          status: 'PENDING',
          validationStatus: null,
        }),
      }),
    });
    filesServiceMock.findFilesForEntity.mockResolvedValue([]);
    productModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'product-1' });

    await service.remove('product-1', 'team-user', UserRole.USER);

    expect(productModelMock.findByIdAndDelete).toHaveBeenCalledWith('product-1');
  });

  it('should reject remove when product owner metadata is missing', async () => {
    productModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        projectId: { toString: () => 'p1' },
        owner: null,
      }),
    });
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'owner-1' },
          team: { memberships: [] },
          status: 'PENDING',
          validationStatus: null,
        }),
      }),
    });

    await expect(
      service.remove('product-1', 'user-1', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should throw when product is not found', async () => {
    productModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.remove('product-404', 'user-1', UserRole.USER),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
