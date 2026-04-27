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
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // GEÇİCİ: Doğrudan müşterinin işlerini ve tekliflerini döndürelim
    const customerJobs = await prisma.job.findMany({
      where: { customerId: user.id },
      include: {
        offers: {
          include: {
            provider: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      user: { id: user.id, role: user.role },
      jobs: customerJobs
    });
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: String(error) }, { status: 500 });
  }
}