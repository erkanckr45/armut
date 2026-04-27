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
      return NextResponse.json([]);
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // DOĞRUDAN RAW SQL İLE MESAJLARI AL
    const messages = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.content,
        m."isRead",
        m."createdAt",
        json_build_object('name', s.name) as sender,
        json_build_object('id', j.id, 'title', j.title) as job
      FROM "Message" m
      JOIN "User" s ON s.id = m."senderId"
      JOIN "Job" j ON j.id = m."jobId"
      WHERE m."receiverId" = ${user.id}
      ORDER BY m."createdAt" DESC
    `;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mesaj API hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}