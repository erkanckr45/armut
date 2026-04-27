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
  });

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  const acceptedOffers = await prisma.offer.findMany({
    where: {
      providerId: user.id,
      status: 'ACCEPTED',
    },
    include: {
      job: {
        include: {
          customer: { select: { name: true, email: true } }
        }
      }
    }
  });

  const jobs = acceptedOffers.map(offer => offer.job);
  return NextResponse.json(jobs);
}