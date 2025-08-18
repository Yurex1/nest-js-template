import { Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('test'),
    Type.Literal('staging'),
    Type.Literal('production'),
  ]),
  PORT: Type.Number({ minimum: 1, maximum: 65535 }),

  DB_HOST: Type.String(),
  DB_PORT: Type.Number({ minimum: 1, maximum: 65535 }),
  DB_USER: Type.String(),
  DB_PASS: Type.String(),
  DB_NAME: Type.String(),

  DB_SYNC: Type.Boolean(),
  DB_LOGGING: Type.Boolean(),

  JWT_SECRET: Type.String({ minLength: 10 }),
  JWT_EXPIRES_IN: Type.String(),
});

export type EnvType = typeof EnvSchema;
