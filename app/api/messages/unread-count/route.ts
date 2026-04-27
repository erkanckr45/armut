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
      return NextResponse.json({ count: 0 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.message.count({
      where: {
        receiverId: user.id,
        isRead: false,
      },
    });

    console.log(`📬 Kullanıcı ${session.user.email} için okunmamış mesaj sayısı: ${count}`);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Unread count hatası:', error);
    return NextResponse.json({ count: 0 });
  }
}