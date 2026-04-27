import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Kullanıcının kategorilerini GET
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { categories: true }
  });

  console.log('GET kategoriler - Kullanıcı:', session.user.email);
  console.log('GET kategoriler - Bulunan:', user?.categories?.length || 0);

  return NextResponse.json(user?.categories || []);
}

// Kullanıcının kategorilerini güncelle POST
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  try {
    const { categories } = await request.json();
    console.log('POST kategoriler - Gelen:', categories);

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        categories: {
          set: categories.map((id: string) => ({ id }))
        }
      },
      include: { categories: true }
    });

    console.log('POST kategoriler - Kaydedilen:', user.categories.map(c => c.id));

    return NextResponse.json({ 
      message: 'Kategoriler güncellendi',
      categories: user.categories 
    });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json({ error: 'Kategoriler güncellenemedi' }, { status: 500 });
  }
}