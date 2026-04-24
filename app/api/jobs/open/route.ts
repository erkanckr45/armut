import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      include: {
        category: true,
        customer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'İşler yüklenemedi' }, { status: 500 });
  }
}