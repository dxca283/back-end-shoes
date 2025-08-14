import { PrismaClient } from '@prisma/client';

let prismaClientSingleton;

function getPrismaClient() {
  if (!prismaClientSingleton) {
    prismaClientSingleton = new PrismaClient();
  }
  return prismaClientSingleton;
}

export const prisma = getPrismaClient();