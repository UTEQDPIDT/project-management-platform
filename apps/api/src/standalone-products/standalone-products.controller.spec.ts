import { Test, TestingModule } from '@nestjs/testing';
import { StandaloneProductsController } from './standalone-products.controller';
import { StandaloneProductsService } from './standalone-products.service';

describe('StandaloneProductsController', () => {
	let controller: StandaloneProductsController;

	const standaloneProductsServiceMock = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findByUser: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [StandaloneProductsController],
			providers: [
				{
					provide: StandaloneProductsService,
					useValue: standaloneProductsServiceMock,
				},
			],
		}).compile();

		controller = module.get<StandaloneProductsController>(
			StandaloneProductsController,
		);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should create a standalone product', async () => {
		const dto = { name: 'Standalone' } as any;
		const file = { originalname: 'test.pdf' } as Express.Multer.File;
		const req = { user: { id: 'user-1' } };
		const result = { id: 'product-1' };

		standaloneProductsServiceMock.create.mockResolvedValue(result);

		await expect(controller.create(dto, file, req)).resolves.toEqual(result);
		expect(standaloneProductsServiceMock.create).toHaveBeenCalledWith(
			dto,
			file,
			'user-1',
		);
	});

	it('should return all standalone products', async () => {
		const result = [{ id: 'product-1' }];
		standaloneProductsServiceMock.findAll.mockResolvedValue(result);

		await expect(controller.findAll()).resolves.toEqual(result);
		expect(standaloneProductsServiceMock.findAll).toHaveBeenCalledTimes(1);
	});

	it('should return one standalone product by id', async () => {
		const result = { id: 'product-1' };
		standaloneProductsServiceMock.findOne.mockResolvedValue(result);

		await expect(controller.findOne('product-1')).resolves.toEqual(result);
		expect(standaloneProductsServiceMock.findOne).toHaveBeenCalledWith('product-1');
	});

	it('should return standalone products by user', async () => {
		const result = [{ id: 'product-1', owner: 'user-1' }];
		standaloneProductsServiceMock.findByUser.mockResolvedValue(result);

		await expect(controller.findByUser('user-1')).resolves.toEqual(result);
		expect(standaloneProductsServiceMock.findByUser).toHaveBeenCalledWith('user-1');
	});

	it('should update a standalone product', async () => {
		const dto = { name: 'Updated standalone' } as any;
		const file = { originalname: 'updated.pdf' } as Express.Multer.File;
		const req = { user: { id: 'user-1' } };
		const result = { id: 'product-1', message: 'updated' };

		standaloneProductsServiceMock.update.mockResolvedValue(result);

		await expect(controller.update('product-1', dto, file, req)).resolves.toEqual(
			result,
		);
		expect(standaloneProductsServiceMock.update).toHaveBeenCalledWith(
			'product-1',
			dto,
			'user-1',
			file,
		);
	});

	it('should remove a standalone product', async () => {
		standaloneProductsServiceMock.remove.mockResolvedValue(undefined);

		await expect(controller.remove('product-1')).resolves.toBeUndefined();
		expect(standaloneProductsServiceMock.remove).toHaveBeenCalledWith('product-1');
	});
});
