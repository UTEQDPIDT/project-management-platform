import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityType, FilePurpose } from '@repo/types';
import { FilesService } from '../files/files.service';
import { StandaloneProduct } from '../schemas/standalone-product.schema';
import { StandaloneProductsService } from './standalone-products.service';

describe('StandaloneProductsService', () => {
	let service: StandaloneProductsService;

	const findQueryMock = {
		populate: jest.fn().mockReturnThis(),
		exec: jest.fn(),
	};

	const findByIdQueryMock = {
		populate: jest.fn().mockReturnThis(),
		exec: jest.fn(),
	};

	const standaloneProductModelMock: any = jest.fn().mockImplementation((dto) => ({
		...dto,
		_id: 'product-1',
		save: jest.fn().mockResolvedValue(undefined),
	}));

	standaloneProductModelMock.find = jest.fn().mockReturnValue(findQueryMock);
	standaloneProductModelMock.findById = jest.fn().mockReturnValue(findByIdQueryMock);
	standaloneProductModelMock.findByIdAndUpdate = jest.fn();
	standaloneProductModelMock.findByIdAndDelete = jest.fn();

	const filesServiceMock = {
		uploadFile: jest.fn(),
		findFilesForEntity: jest.fn(),
		deleteFiles: jest.fn(),
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StandaloneProductsService,
				{
					provide: getModelToken(StandaloneProduct.name),
					useValue: standaloneProductModelMock,
				},
				{ provide: FilesService, useValue: filesServiceMock },
			],
		}).compile();

		service = module.get<StandaloneProductsService>(StandaloneProductsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should create standalone product and upload file', async () => {
		const dto = { name: 'Standalone' } as any;
		const file = { originalname: 'file.pdf' } as Express.Multer.File;

		const result = await service.create(dto, file, 'user-1');

		expect(standaloneProductModelMock).toHaveBeenCalledWith({
			...dto,
			owner: 'user-1',
			updatedBy: 'user-1',
		});
		expect(filesServiceMock.uploadFile).toHaveBeenCalledWith(
			file,
			'product-1',
			EntityType.STANDALONE_PRODUCT,
			FilePurpose.GENERIC,
			'user-1',
		);
		expect(result).toEqual(
			expect.objectContaining({
				_id: 'product-1',
				owner: 'user-1',
				updatedBy: 'user-1',
			}),
		);
	});

	it('should throw BadRequestException when create fails', async () => {
		const saveError = new Error('db create error');
		standaloneProductModelMock.mockImplementationOnce((dto) => ({
			...dto,
			_id: 'product-1',
			save: jest.fn().mockRejectedValue(saveError),
		}));

		await expect(
			service.create({ name: 'Standalone' } as any, {} as Express.Multer.File, 'user-1'),
		).rejects.toBeInstanceOf(BadRequestException);
	});

	it('should return all standalone products', async () => {
		const products = [{ _id: 'product-1' }];
		findQueryMock.exec.mockResolvedValue(products);

		await expect(service.findAll()).resolves.toEqual(products);
		expect(standaloneProductModelMock.find).toHaveBeenCalledTimes(1);
	});

	it('should return standalone products by user', async () => {
		const products = [{ _id: 'product-1', owner: 'user-1' }];
		findQueryMock.exec.mockResolvedValue(products);

		await expect(service.findByUser('user-1')).resolves.toEqual(products);
		expect(standaloneProductModelMock.find).toHaveBeenCalledWith({ owner: 'user-1' });
	});

	it('should return one standalone product by id', async () => {
		const product = { _id: 'product-1' };
		findByIdQueryMock.exec.mockResolvedValue(product);

		await expect(service.findOne('product-1')).resolves.toEqual(product);
		expect(standaloneProductModelMock.findById).toHaveBeenCalledWith('product-1');
	});

	it('should throw NotFoundException when product does not exist in findOne', async () => {
		findByIdQueryMock.exec.mockResolvedValue(null);

		await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
	});

	it('should update standalone product with file', async () => {
		filesServiceMock.findFilesForEntity.mockResolvedValue([{ _id: 'file-1' }]);
		filesServiceMock.deleteFiles.mockResolvedValue(undefined);
		filesServiceMock.uploadFile.mockResolvedValue(undefined);
		standaloneProductModelMock.findByIdAndUpdate.mockResolvedValue({ _id: 'product-1' });

		const result = await service.update(
			'product-1',
			{ name: 'Updated' } as any,
			'user-1',
			{ originalname: 'updated.pdf' } as Express.Multer.File,
		);

		expect(filesServiceMock.findFilesForEntity).toHaveBeenCalledWith('product-1');
		expect(filesServiceMock.deleteFiles).toHaveBeenCalledWith([{ _id: 'file-1' }]);
		expect(filesServiceMock.uploadFile).toHaveBeenCalledWith(
			expect.any(Object),
			'product-1',
			EntityType.STANDALONE_PRODUCT,
			FilePurpose.GENERIC,
			'user-1',
		);
		expect(standaloneProductModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
			'product-1',
			{ name: 'Updated', updatedBy: 'user-1' },
			{ new: true },
		);
		expect(result).toEqual({
			id: 'product-1',
			message: 'Producto independiente actualizado correctamente',
		});
	});

	it('should throw NotFoundException when update target does not exist', async () => {
		standaloneProductModelMock.findByIdAndUpdate.mockResolvedValue(null);

		await expect(
			service.update('missing-id', { name: 'Updated' } as any, 'user-1'),
		).rejects.toBeInstanceOf(NotFoundException);
	});

	it('should remove standalone product and related files', async () => {
		findByIdQueryMock.exec.mockResolvedValue({ _id: 'product-1' });
		filesServiceMock.findFilesForEntity.mockResolvedValue([{ _id: 'file-1' }]);
		filesServiceMock.deleteFiles.mockResolvedValue(undefined);
		standaloneProductModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'product-1' });

		const result = await service.remove('product-1');

		expect(standaloneProductModelMock.findById).toHaveBeenCalledWith('product-1');
		expect(filesServiceMock.findFilesForEntity).toHaveBeenCalledWith('product-1');
		expect(filesServiceMock.deleteFiles).toHaveBeenCalledWith([{ _id: 'file-1' }]);
		expect(standaloneProductModelMock.findByIdAndDelete).toHaveBeenCalledWith('product-1');
		expect(result).toEqual({
			id: 'product-1',
			message: 'Producto independiente eliminado correctamente',
		});
	});

	it('should throw NotFoundException when remove target does not exist', async () => {
		findByIdQueryMock.exec.mockResolvedValue(null);

		await expect(service.remove('missing-id')).rejects.toBeInstanceOf(NotFoundException);
	});
});
