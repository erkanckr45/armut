'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AktifIslerim() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs/my-active')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  if (status === 'loading' || loading) return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📋 Aktif İşlerim</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>
      
      {jobs.length === 0 && <p>Henüz aktif işiniz bulunmuyor.</p>}
      
      {jobs.map((job: any) => (
        <div key={job.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', marginBottom: '20px', background: '#f9f9f9' }}>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p><strong>📍 {job.city}, {job.district}</strong></p>
          <p><strong>💰 Bütçe:</strong> {job.budget} TL</p>
          <p><strong>👤 İlan Sahibi:</strong> {job.customer?.name}</p>
          
          <Link href={`/mesajlar/${job.id}`}>
            <button style={{ marginTop: '10px', padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              💬 Mesaj Gönder
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}