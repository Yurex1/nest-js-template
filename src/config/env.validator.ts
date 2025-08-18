import { Value } from '@sinclair/typebox/value';
import { EnvSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const result = Value.Convert(EnvSchema, config);
  if (!Value.Check(EnvSchema, result)) {
    const errors = [...Value.Errors(EnvSchema, result)]
      .map((err) => `${err.path}: ${err.message}`)
      .join('; ');
    throw new Error(`Invalid environment variables: ${errors}`);
  }
  return result;
}
