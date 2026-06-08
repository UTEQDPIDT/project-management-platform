import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World! The ci pipeline is working and the API is up.');
  });

  it.todo('POST /projects should reject payload with fewer than 3 activities');
  it.todo('POST /projects should create project with status PENDING when activities are valid');
  it.todo('PATCH /activities/:id should move project status to IN_PROGRESS for mixed statuses');
  it.todo('PATCH /activities/:id should move project status to COMPLETED when all are completed');
  it.todo('DELETE /activities/:id should reject deletion when project would have fewer than 3 activities');
});
