const { PrismaClient } = require('@prisma/client')

const DATABASE_URL = "postgresql://neondb_owner:npg_sbjQ7c2ThyfV@ep-autumn-bonus-amd88j7g-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

const prisma = new PrismaClient()

const categories = [
  { name: "Ev Temizliği", slug: "ev-temizligi", icon: "🧹" },
  { name: "Nakliyat", slug: "nakliyat", icon: "🚚" },
  { name: "Elektrik", slug: "elektrik", icon: "⚡" },
  { name: "Sıhhi Tesisat", slug: "sihhi-tesisat", icon: "🔧" },
  { name: "Boyama & Badana", slug: "boyama-badana", icon: "🎨" },
  { name: "Mobilya & Montaj", slug: "mobilya-montaj", icon: "🪑" },
  { name: "Bilgisayar & Teknoloji", slug: "bilgisayar-teknoloji", icon: "💻" },
  { name: "Özel Ders", slug: "ozel-ders", icon: "📚" },
  { name: "Saç & Güzellik", slug: "sac-guzellik", icon: "💇" },
  { name: "Sağlık & Fitness", slug: "saglik-fitness", icon: "🏋️" },
  { name: "Organizasyon", slug: "organizasyon", icon: "🎉" },
  { name: "Tadilat & Dekorasyon", slug: "tadilat-dekorasyon", icon: "🏠" },
  { name: "Bahçe & Peyzaj", slug: "bahce-peyzaj", icon: "🌿" },
  { name: "Pet & Hayvan", slug: "pet-hayvan", icon: "🐕" },
]

async function main() {
  console.log("🌱 Kategoriler ekleniyor...")
  
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    console.log(`✅ ${cat.name} eklendi`)
  }
  
  console.log("🎉 Tüm kategoriler başarıyla eklendi!")
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())