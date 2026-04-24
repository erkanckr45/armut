import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
    }

    const jobs = await prisma.job.findMany({
      where: {
        categoryId: category.id,
        status: 'OPEN',
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ category, jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}