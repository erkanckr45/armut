import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  try {
    const { jobId, price, message } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Sadece hizmet verenler teklif verebilir' }, { status: 403 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { customerId: true, status: true }
    });

    if (!job) {
      return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 });
    }

    if (job.customerId === user.id) {
      return NextResponse.json({ error: 'Kendi işinize teklif veremezsiniz!' }, { status: 403 });
    }

    if (job.status !== 'OPEN') {
      return NextResponse.json({ error: 'Bu iş artık açık değil' }, { status: 400 });
    }

    const existingOffer = await prisma.offer.findFirst({
      where: { jobId, providerId: user.id }
    });

    if (existingOffer) {
      return NextResponse.json({ error: 'Bu işe zaten teklif verdiniz' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        price,
        message,
        jobId,
        providerId: user.id,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Teklif hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Teklif oluşturulamadı';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}