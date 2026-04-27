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
    // Raw SQL ile teklifleri getir
    const result = await prisma.$queryRaw`
      SELECT 
        o.id,
        o.price,
        o.message,
        o.status,
        o."createdAt",
        json_build_object('id', j.id, 'title', j.title, 'description', j.description) as job,
        json_build_object('id', p.id, 'name', p.name, 'email', p.email) as provider
      FROM "Offer" o
      JOIN "Job" j ON j.id = o."jobId"
      JOIN "User" p ON p.id = o."providerId"
      WHERE j."customerId" = ${user.id}
      ORDER BY o."createdAt" DESC
    `;
    
    // JSON alanlarını parse et
    offers = (result as any[]).map(row => ({
      ...row,
      job: typeof row.job === 'string' ? JSON.parse(row.job) : row.job,
      provider: typeof row.provider === 'string' ? JSON.parse(row.provider) : row.provider
    }));
  } else {
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