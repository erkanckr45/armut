'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MessageModal from '../components/MessageModal';

interface WonJob {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  budget: number | null;
  category: { icon: string; name: string };
  customer: { name: string; email: string };
  offerPrice: number;
  offerMessage: string;
}

export default function KazandigimIsler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<WonJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/jobs/won')
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
        <h1>🏆 Kazandığım İşler</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>
      
      {jobs.length === 0 && <p>Henüz kazandığın bir iş yok. Teklif vermeye devam et!</p>}
      
      {jobs.map((job) => (
        <div key={job.id} style={{ border: '2px solid #4caf50', borderRadius: '10px', padding: '15px', marginBottom: '20px', background: '#f0fff0' }}>
          <h3>🏆 {job.title}</h3>
          <p>{job.description}</p>
          <p><strong>📍 {job.city}, {job.district}</strong></p>
          <p><strong>💰 Teklif Fiyatın:</strong> {job.offerPrice} TL</p>
          <p><strong>💬 Teklif Mesajın:</strong> {job.offerMessage}</p>
          <p><strong>📂 Kategori:</strong> {job.category?.icon} {job.category?.name}</p>
          <p><strong>👤 İlan Sahibi:</strong> {job.customer?.name}</p>
          
          {/* Mesaj Gönder Butonu - Modal açar */}
          <button 
            onClick={() => setSelectedJobId(job.id)}
            style={{ marginTop: '15px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            💬 Mesaj Gönder
          </button>
        </div>
      ))}

      {/* Mesaj Modal'ı */}
      {selectedJobId && (
        <MessageModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  );
}