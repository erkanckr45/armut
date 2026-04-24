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

    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Sadece hizmet verenler teklif verebilir' }, { status: 403 });
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
    return NextResponse.json({ error: 'Teklif oluşturulamadı' }, { status: 500 });
  }
}