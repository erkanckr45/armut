import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  const { jobId } = await request.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Sadece müşteriler iş tamamlayabilir' }, { status: 403 });
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, customerId: user.id },
  });

  if (!job) {
    return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 });
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'COMPLETED' },
  });

  return NextResponse.json({ success: true });
}