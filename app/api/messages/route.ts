import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { sendMessageNotification } from '@/app/lib/mail';

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

  const messages = await prisma.message.findMany({
    where: { jobId },
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

    const { jobId, content } = await request.json();

    if (!jobId || !content) {
      return NextResponse.json({ error: 'jobId ve content gerekli' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        offers: {
          where: { status: 'ACCEPTED' },
          include: { provider: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 });
    }

    let receiverId: string;
    if (job.customerId === currentUser.id) {
      if (job.offers.length === 0) {
        return NextResponse.json({ error: 'Bu işi kabul eden bir usta yok' }, { status: 400 });
      }
      receiverId = job.offers[0].providerId;
    } else {
      receiverId = job.customerId;
    }

    const message = await prisma.message.create({
      data: {
        content,
        jobId,
        senderId: currentUser.id,
        receiverId,
      },
      include: {
        sender: { select: { name: true } },
      },
    });

    // MAİL BİLDİRİMİ GÖNDER
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (receiver && receiver.email && process.env.EMAIL_USER) {
      await sendMessageNotification(
        receiver.email,
        currentUser.name,
        job.title,
        content,
        jobId
      );
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Mesaj hatası:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}