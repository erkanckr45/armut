import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        role: true,
        createdAt: true,
        reviewsReceived: {
          include: {
            reviewer: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            jobs: true,
            offers: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // reviewsReceived alanını reviews olarak döndür (frontend beklentisi için)
    const { reviewsReceived, ...rest } = user;
    
    return NextResponse.json({
      ...rest,
      reviews: reviewsReceived
    });
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}