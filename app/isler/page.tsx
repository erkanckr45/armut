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
  const [offerPrice, setOfferPrice] = useState<Record<string, string>>({});
  const [offerMessage, setOfferMessage] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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

  const handleTeklifVer = async (jobId: string) => {
    const price = offerPrice[jobId];
    const msg = offerMessage[jobId];

    if (!price || !msg) {
      setMessage('❌ Lütfen fiyat ve mesaj girin');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        price: parseFloat(price),
        message: msg,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Teklifiniz gönderildi!');
      setOfferPrice({ ...offerPrice, [jobId]: '' });
      setOfferMessage({ ...offerMessage, [jobId]: '' });
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`❌ ${data.error || 'Teklif gönderilemedi'}`);
    }
  };

  const isOwnJob = (job: Job) => {
    return job.customer?.email === session.user?.email;
  };

  const isProvider = () => {
    return session.user?.role === 'PROVIDER';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📋 Açık İşler</h1>
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      {jobs.length === 0 && <p>Henüz açık iş bulunmuyor.</p>}
      
      {jobs.map((job) => (
        <div key={job.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', marginBottom: '20px', background: '#f9f9f9' }}>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p><strong>📍 {job.city}, {job.district}</strong></p>
          <p><strong>💰 Bütçe:</strong> {job.budget ? `${job.budget} TL` : 'Belirtilmemiş'}</p>
          <p><strong>📂 Kategori:</strong> {job.category?.icon} {job.category?.name}</p>
          <p><strong>👤 İlan Sahibi:</strong> {job.customer?.name}</p>
          
          {/* Teklif Verme Bölümü - Sadece Ustalar için ve kendi işi DEĞİLSE */}
          {isProvider() && !isOwnJob(job) && (
            <div style={{ marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
              <h4>📝 Teklif Ver</h4>
              <input 
                type="number" 
                placeholder="Fiyat (₺)" 
                value={offerPrice[job.id] || ''}
                onChange={(e) => setOfferPrice(prev => ({ ...prev, [job.id]: e.target.value }))}
                style={{ padding: '8px', marginRight: '10px', width: '150px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
              <input 
                type="text" 
                placeholder="Teklif mesajınız" 
                value={offerMessage[job.id] || ''}
                onChange={(e) => setOfferMessage(prev => ({ ...prev, [job.id]: e.target.value }))}
                style={{ padding: '8px', marginRight: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
              <button 
                onClick={() => handleTeklifVer(job.id)} 
                style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Teklif Ver
              </button>
            </div>
          )}

          {/* Mesajlaşma Butonu - Sadece başkasının işinde göster */}
          {!isOwnJob(job) && (
            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedJobId(job.id)}
                style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                💬 Mesaj Gönder
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Mesaj Modal'ı */}
      {selectedJobId && (
        <MessageModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  );
}