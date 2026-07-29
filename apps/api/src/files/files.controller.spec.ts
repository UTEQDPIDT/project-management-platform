import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;

  const filesServiceMock = {
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    findAll: jest.fn(),
    findFilesForEntity: jest.fn(),
    getFileMetadata: jest.fn(),
    getStream: jest.fn(),
    deleteFile: jest.fn(),
    deleteFilesByOwner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: filesServiceMock }],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
