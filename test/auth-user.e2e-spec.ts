import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';

describe('Auth + User E2E', () => {
  let app: INestApplication;
  let server: Server;

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
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('create user (sign-up)', async () => {
    const res = await request(server)
      .post('/auth/sign-up')
      .send({ email, firstName, lastName, password })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('login user (sign-in)', async () => {
    const res = await request(server)
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
    const res = await request(server)
      .post('/auth/refresh-tokens')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('get all users', async () => {
    const res = await request(server)
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
    const res = await request(server)
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

    const res = await request(server)
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
    await request(server)
      .patch('/user/restore-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: password, newPassword })
      .expect(200);

    await request(server)
      .post('/auth/sign-in')
      .send({ email, password })
      .expect(401);

    const res = await request(server)
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
    await request(server)
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const after = await request(server)
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(after.body).toBeNull();
  });
});
