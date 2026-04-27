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
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      role: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
  }

  try {
    const { name, phone, bio } = await request.json();

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name: name,
        phone: phone || null,
        bio: bio || null
      },
    });

    return NextResponse.json({ 
      message: 'Profil güncellendi', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json({ error: 'Profil güncellenemedi' }, { status: 500 });
  }
}