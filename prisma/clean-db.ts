import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

async function clean() {
  const url = process.env.DATABASE_URL || 'file:./dev.db';
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  console.log('Cleaning database: removing all dummy problems...');
  await prisma.problemSolution.deleteMany({});
  await prisma.revisionLog.deleteMany({});
  await prisma.problemTag.deleteMany({});
  await prisma.problemRelation.deleteMany({});
  await prisma.problem.deleteMany({});
  console.log('Database cleaned successfully!');
}

clean().catch((err) => console.error(err));
