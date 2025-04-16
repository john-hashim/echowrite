// src/prisma/client.ts
import { PrismaClient } from '../generated/prisma/client';

// Create a single instance of Prisma Client
const prisma = new PrismaClient();

export { prisma };