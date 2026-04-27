import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  const { offerId, jobId } = await request.json();

  try {
    // Önce diğer teklifleri reddet
    await prisma.offer.updateMany({
      where: { jobId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    // Bu teklifi kabul et
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });

    // İşin durumunu güncelle
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({ message: 'Teklif kabul edildi' });
  } catch (error) {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}