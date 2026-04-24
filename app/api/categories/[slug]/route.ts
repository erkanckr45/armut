import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // params bir Promise, await ile aç
    const { slug } = await params;
    
    // Dinamik import ile Prisma modüllerini al (Edge runtime için)
    const { PrismaClient } = await import('@prisma/client');
    const { Pool } = await import('pg');
    const { PrismaPg } = await import('@prisma/adapter-pg');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const category = await prisma.category.findUnique({
      where: { slug: slug },
    });

    if (!category) {
      return NextResponse.json(
        { error: `Kategori bulunamadı: ${slug}` },
        { status: 404 }
      );
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
  } catch (error: any) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}