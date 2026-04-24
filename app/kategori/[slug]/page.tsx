'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  budget: number | null;
  customer: { name: string };
  createdAt: string;
}

export default function KategoriSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const { data: session } = useSession();
  const [category, setCategory] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // params Promise'ini çöz
    params.then((resolved) => {
      setSlug(resolved.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`/api/categories/${slug}`)
      .then(res => res.json())
      .then(data => {
        setCategory(data.category);
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  if (!category) return <div>Kategori bulunamadı: {slug}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <h1>{category.icon} {category.name}</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>

      <h2>Bu kategorideki işler</h2>
      {jobs.length === 0 ? (
        <p>Henüz bu kategoride iş ilanı yok. İlk iş ilanını sen ver!</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', background: '#fff' }}>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p><strong>📍 {job.city}, {job.district}</strong></p>
              <p><strong>💰 Bütçe:</strong> {job.budget ? `${job.budget} TL` : 'Belirtilmemiş'}</p>
              <p><strong>👤 İlan Sahibi:</strong> {job.customer?.name}</p>
              <p><strong>📅 Tarih:</strong> {new Date(job.createdAt).toLocaleDateString('tr-TR')}</p>
            </div>
          ))}
        </div>
      )}

      {session && (
        <Link href="/is-ver">
          <button style={{ marginTop: '30px', padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
            + Bu Kategoride İş Ver
          </button>
        </Link>
      )}
    </div>
  );
}