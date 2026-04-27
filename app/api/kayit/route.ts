import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanlar gerekli' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER',
      },
    });

    return NextResponse.json({ 
      message: 'Kayıt başarılı', 
      userId: user.id,
      role: user.role 
    }, { status: 201 });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}