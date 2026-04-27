import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId gerekli' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      jobId: jobId,
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
    },
    include: {
      sender: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, content } = body;

    if (!jobId || !content || content.trim() === '') {
      return NextResponse.json({ error: 'jobId ve content gerekli' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // İşi bul
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        offers: {
          where: { status: 'ACCEPTED' },
          take: 1,
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 });
    }

    // Alıcıyı belirle (karşı taraf)
    let receiverId: string;
    if (job.customerId === currentUser.id) {
      // Gönderen müşteri ise, işi alan ustayı bul
      if (job.offers.length === 0) {
        return NextResponse.json({ error: 'Bu işi alan bir usta henüz yok' }, { status: 400 });
      }
      receiverId = job.offers[0].providerId;
    } else {
      // Gönderen usta ise, müşteriye gönder
      receiverId = job.customerId;
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        jobId,
        senderId: currentUser.id,
        receiverId,
      },
      include: {
        sender: { select: { name: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}