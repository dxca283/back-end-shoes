import { PrismaClient } from '@prisma/client';

let prismaClientInstance;

export const getPrismaClient = () => {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient();
  }
  return prismaClientInstance;
};

export default getPrismaClient();