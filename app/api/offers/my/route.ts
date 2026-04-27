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
    console.log('=== API /offers/my çağrıldı ===');
    
    const session = await getServerSession();
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('Giriş yok');
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });
    
    console.log('Kullanıcı bulundu:', user?.id, user?.role);

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    let offers = [];

    if (user.role === 'CUSTOMER') {
      console.log('Müşteri teklifleri aranıyor...');
      
      // Basit sorgu ile dene
      offers = await prisma.offer.findMany({
        where: {
          job: {
            customerId: user.id
          }
        },
        include: {
          job: true,
          provider: {
            select: { name: true, email: true }
          }
        }
      });
      
      console.log('Bulunan teklif sayısı:', offers.length);
    } else {
      offers = await prisma.offer.findMany({
        where: { providerId: user.id },
        include: {
          job: true
        }
      });
    }

    return NextResponse.json(offers);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}