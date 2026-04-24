import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, categoryId, description, city, district, budget } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'Kategori seçmelisiniz' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const job = await prisma.job.create({
      data: {
        title,
        description,
        city,
        district,
        address: city + ' ' + district,
        budget: budget || null,
        expiresAt,
        customerId: user.id,
        categoryId: categoryId,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error('Job oluşturma hatası:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Geçersiz kategori seçimi' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'İş oluşturulamadı: ' + error.message }, { status: 500 });
  }
}