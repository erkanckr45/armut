'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MessageModal from '../components/MessageModal';

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  budget: number | null;
  category: { icon: string; name: string };
  customer: { id: string; name: string; email: string };
}

export default function Isler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isReadUpdating, setIsReadUpdating] = useState(false);

  useEffect(() => {
    fetch('/api/jobs/open')
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

  const isOwnJob = (job: Job) => {
    return job.customer?.email === session.user?.email;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📋 {session.user?.role === 'CUSTOMER' ? 'Kendi İşlerim' : 'Açık İşler'}</h1>
        <button onClick={() => router.push('/')} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🏠 Ana Sayfa
        </button>
      </div>

      {jobs.length === 0 && <p>Henüz iş bulunmuyor.</p>}

      {jobs.map((job) => (
        <div key={job.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', marginBottom: '20px', background: '#f9f9f9' }}>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p><strong>📍 {job.city}, {job.district}</strong></p>
          <p><strong>💰 Bütçe:</strong> {job.budget ? `${job.budget} TL` : 'Belirtilmemiş'}</p>
          <p><strong>📂 Kategori:</strong> {job.category?.icon} {job.category?.name}</p>
          <p><strong>👤 İlan Sahibi:</strong> {job.customer?.name}</p>

          {/* Eğer müşteri kendi işini görüyorsa MESAJLAŞMA BUTONU */}
          {session.user?.role === 'CUSTOMER' && isOwnJob(job) && (
            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedJobId(job.id)}
                style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                💬 Mesajları Gör
              </button>
            </div>
          )}
        </div>
      ))}

      {selectedJobId && (
        <MessageModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  );
}