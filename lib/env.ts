import { z } from 'zod';

const envSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  PYTHON_PIPELINE_PATH: z.string().optional(),
  REVALIDATION_SECRET: z.string().min(32).optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}

export const env = {
  get FIREBASE_PROJECT_ID() {
    return process.env.FIREBASE_PROJECT_ID ?? '';
  },
  get FIREBASE_CLIENT_EMAIL() {
    return process.env.FIREBASE_CLIENT_EMAIL ?? '';
  },
  get FIREBASE_PRIVATE_KEY() {
    return process.env.FIREBASE_PRIVATE_KEY ?? '';
  },
  get PYTHON_PIPELINE_PATH() {
    return process.env.PYTHON_PIPELINE_PATH ?? '';
  },
  get REVALIDATION_SECRET() {
    return process.env.REVALIDATION_SECRET ?? '';
  },
};
