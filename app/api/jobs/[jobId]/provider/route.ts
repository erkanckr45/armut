import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        offers: {
          where: { status: 'ACCEPTED' },
          include: { provider: true },
          take: 1,
        },
      },
    });

    if (!job || job.offers.length === 0 || !job.offers[0].provider) {
      return NextResponse.json({ error: 'Usta bulunamadı' }, { status: 404 });
    }

    const { password, ...provider } = job.offers[0].provider;
    return NextResponse.json(provider);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}