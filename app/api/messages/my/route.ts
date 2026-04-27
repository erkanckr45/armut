import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const messages = await prisma.message.findMany({
      where: {
        receiverId: user.id,
      },
      include: {
        sender: { select: { name: true } },
        job: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mesaj API hatası:', error);
    return NextResponse.json([]);
  }
}