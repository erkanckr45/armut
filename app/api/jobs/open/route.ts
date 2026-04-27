import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const session = await getServerSession();
  
  let whereCondition: any = { status: 'OPEN' };
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { categories: true }
    });
    
    if (user) {
      if (user.role === 'CUSTOMER') {
        // Müşteri: Kendi işlerini görür (OPEN veya IN_PROGRESS)
        whereCondition = {
          customerId: user.id,
          status: { in: ['OPEN', 'IN_PROGRESS'] }
        };
      } else if (user.role === 'PROVIDER') {
        // USTA: Teklif verdiği işleri GÖRMEZ
        const offeredJobs = await prisma.offer.findMany({
          where: { providerId: user.id },
          select: { jobId: true }
        });
        const offeredJobIds = offeredJobs.map(o => o.jobId);
        
        const userCategoryIds = user.categories.map(c => c.id);
        if (userCategoryIds.length > 0) {
          whereCondition = {
            status: 'OPEN',
            categoryId: { in: userCategoryIds },
            id: { not: { in: offeredJobIds } }
          };
        } else {
          return NextResponse.json([]);
        }
      }
    }
  }
  
  const jobs = await prisma.job.findMany({
    where: whereCondition,
    include: {
      category: true,
      customer: {
        select: { name: true, email: true, id: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  
  return NextResponse.json(jobs);
}