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
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  let offers = [];

  if (user.role === 'CUSTOMER') {
    // Müşteri: Kendi işlerine GELEN teklifler
    offers = await prisma.offer.findMany({
      where: {
        job: { customerId: user.id }
      },
      include: {
        job: true,
        provider: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    // Usta: VERDİĞİ teklifler
    offers = await prisma.offer.findMany({
      where: { providerId: user.id },
      include: {
        job: {
          include: {
            customer: { select: { name: true, email: true } }
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  return NextResponse.json(offers);
}