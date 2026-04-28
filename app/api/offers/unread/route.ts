import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ count: 0 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true }
  });

  if (!user || user.role !== 'CUSTOMER') {
    return NextResponse.json({ count: 0 });
  }

  const unreadOffers = await prisma.offer.count({
    where: {
      job: { customerId: user.id },
      status: 'PENDING',
      isRead: false
    }
  });

  return NextResponse.json({ count: unreadOffers });
}