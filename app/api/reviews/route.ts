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

  const { jobId, rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Geçerli bir puan girin (1-5)' }, { status: 400 });
  }

  const customer = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!customer || customer.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Sadece müşteriler değerlendirme yapabilir' }, { status: 403 });
  }

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

  if (!job || job.customerId !== customer.id) {
    return NextResponse.json({ error: 'Bu iş size ait değil' }, { status: 403 });
  }

  if (job.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'İş tamamlanmadan değerlendirme yapamazsınız' }, { status: 400 });
  }

  const existingReview = await prisma.review.findUnique({
    where: { jobId },
  });

  if (existingReview) {
    return NextResponse.json({ error: 'Bu iş için zaten değerlendirme yapıldı' }, { status: 400 });
  }

  const providerId = job.offers[0]?.providerId;
  if (!providerId) {
    return NextResponse.json({ error: 'Usta bulunamadı' }, { status: 404 });
  }

  await prisma.review.create({
    data: {
      rating,
      comment: comment || '',
      jobId,
      reviewerId: customer.id,
      reviewedId: providerId,
    },
  });

  return NextResponse.json({ success: true });
}