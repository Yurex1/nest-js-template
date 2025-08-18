import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { UserModule } from '../src/user/user.module';
import { CommonModule } from '../src/common/common.module';
import { HasExistingIdConstraint } from '../src/common/constraints/has-existing-id.constraint';
import { useContainer } from 'class-validator';

describe('Auth + User E2E', () => {
  let app: INestApplication;
  let server: ReturnType<typeof request>;

  const unique = Date.now();
  const email = `e2e+${unique}@example.com`;
  const firstName = 'John';
  const lastName = 'Doe';
  const password = 'Password123!';
  const newPassword = 'NewPassword123!';

  let accessToken: string;
  let refreshToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.local',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            synchronize: process.env.DB_SYNC === 'true',
            logging: process.env.DB_LOGGING === 'true',
            autoLoadEntities: true,
          }),
        }),
        UserModule,
        CommonModule,
        AuthModule,
      ],
      providers: [HasExistingIdConstraint],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable DI in class-validator (for HasExistingIdConstraint -> DataSource)
    useContainer(app.select(AuthModule), { fallbackOnErrors: true });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    server = request(
      app.getHttpServer() as unknown as Parameters<typeof request>[0],
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('create user (sign-up)', async () => {
    const res = await server
      .post('/auth/sign-up')
      .send({ email, firstName, lastName, password })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('login user (sign-in)', async () => {
    const res = await server
      .post('/auth/sign-in')
      .send({ email, password })
      .expect(201);

    interface AuthResponse {
      access_token: string;
      refresh_token: string;
    }

    const { access_token, refresh_token }: AuthResponse =
      res.body as AuthResponse;

    accessToken = access_token;
    refreshToken = refresh_token;
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');
  });

  it('refresh tokens', async () => {
    const res = await server
      .post('/auth/refresh-tokens')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('get all users', async () => {
    const res = await server
      .get('/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    interface User {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    }

    const users: User[] = res.body as User[];
    const me = users.find((u) => u.email === email);
    expect(me).toBeTruthy();
    if (!me) {
      throw new Error('User not found in the list of users');
    }
    userId = me.id;
    expect(typeof userId).toBe('number');
  });

  it('get user by id', async () => {
    const res = await server
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    interface UserResponse {
      email: string;
      firstName: string;
      lastName: string;
    }

    const user: UserResponse = res.body as UserResponse;

    expect(user).toBeTruthy();
    expect(user.email).toBe(email);
  });

  it('update user', async () => {
    const updatedFirst = 'Johnny';
    const updatedLast = 'Doel';

    interface UpdateUserResponse {
      firstName: string;
      lastName: string;
    }

    const res = await server
      .patch(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: updatedFirst, lastName: updatedLast })
      .expect(200);

    const responseBody: UpdateUserResponse = res.body as UpdateUserResponse;

    expect(responseBody).toBeTruthy();
    expect(responseBody.firstName).toBe(updatedFirst);
    expect(responseBody.lastName).toBe(updatedLast);
  });

  it('restore password', async () => {
    await server
      .patch('/user/restore-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: password, newPassword })
      .expect(200);

    // old password should fail
    await server.post('/auth/sign-in').send({ email, password }).expect(401);

    // new password should succeed
    const res = await server
      .post('/auth/sign-in')
      .send({ email, password: newPassword })
      .expect(201);

    interface SignInResponse {
      access_token: string;
    }

    const responseBody: SignInResponse = res.body as SignInResponse;
    accessToken = responseBody.access_token;
  });

  it('delete user', async () => {
    await server
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await server
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
