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
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  const acceptedOffers = await prisma.offer.findMany({
    where: {
      providerId: user.id,
      status: 'ACCEPTED'
    },
    include: {
      job: {
        include: {
          category: true,
          customer: {
            select: { name: true, email: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const wonJobs = acceptedOffers.map(offer => ({
    id: offer.job.id,
    title: offer.job.title,
    description: offer.job.description,
    city: offer.job.city,
    district: offer.job.district,
    budget: offer.job.budget,
    category: offer.job.category,
    customer: offer.job.customer,
    offerPrice: offer.price,
    offerMessage: offer.message
  }));

  return NextResponse.json(wonJobs);
}