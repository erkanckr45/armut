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

  console.log('Kullanıcı ID:', user.id);
  console.log('Kullanıcı Rol:', user.role);

  let offers = [];

  if (user.role === 'CUSTOMER') {
    // Müşteri: Job'ları üzerinden teklifleri bul
    const customerJobs = await prisma.job.findMany({
      where: { customerId: user.id },
      select: { id: true }
    });
    
    const jobIds = customerJobs.map(job => job.id);
    console.log('Müşterinin iş IDleri:', jobIds);
    
    offers = await prisma.offer.findMany({
      where: {
        jobId: { in: jobIds }
      },
      include: {
        job: true,
        provider: { 
          select: { id: true, name: true, email: true } 
        }
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

  console.log('Bulunan teklif sayısı:', offers.length);
  return NextResponse.json(offers);
}