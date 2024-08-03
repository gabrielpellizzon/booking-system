import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersModule } from 'src/modules/users/users.module';
import { RoomsModule } from 'src/modules/rooms/rooms.module';
import { PrismaClient } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, RoomsModule, PrismaClient],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaClient = moduleFixture.get<PrismaClient>(PrismaClient);
    await prismaClient.$executeRaw`TRUNCATE "public"."Room" RESTART IDENTITY CASCADE;`;
    await prismaClient.$executeRaw`TRUNCATE "public"."User" RESTART IDENTITY CASCADE;`;
  }, 30000);

  afterAll(async () => {
    await app.close();
    await prismaClient.$disconnect();
  }, 30000);

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should create a user', async () => {
    const user = {
      email: 'test@user.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'password',
    };

    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send(user)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: null,
      isAdmin: false,
      createdAt: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      ),
    });
  });

  it('should login a user', async () => {
    const user = {
      email: 'test@user.com',
      passwordHash: 'password',
    };

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send(user)

      .expect(201);

    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });

  it('should not login a user', async () => {
    const user = {
      email: 'awdadadad@e2e.test',
      passwordHash: '12345678',
    };

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send(user);

    expect(response.body.message).toEqual('User not found');
    expect(response.body.status).toEqual(404);
  });
});
