'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Degerlendir() {
  const { jobId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/provider`)
      .then(res => res.json())
      .then(data => {
        setProvider(data);
        setLoadingProvider(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingProvider(false);
      });
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, rating, comment }),
    });

    if (res.ok) {
      setMessage('✅ Değerlendirmeniz kaydedildi! Teşekkür ederiz.');
      setTimeout(() => router.push('/'), 2000);
    } else {
      const data = await res.json();
      setMessage(`❌ ${data.error || 'Bir hata oluştu'}`);
    }
    setSubmitting(false);
  };

  if (loadingProvider) return <div>Yükleniyor...</div>;
  if (!provider) return <div>Usta bulunamadı</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <Link href="/">
        <button style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
          ← Ana Sayfa
        </button>
      </Link>
      
      <h1>⭐ Ustayı Değerlendir</h1>
      <h3>{provider.name}</h3>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Puanınız (1-5)</label>
          <div style={{ fontSize: '40px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '40px',
                  color: star <= rating ? '#ffc107' : '#e4e5e9'
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Yorumunuz</label>
          <textarea
            placeholder="Usta hakkındaki düşüncelerinizi yazın..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting}
          style={{ 
            padding: '12px 24px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {submitting ? 'Kaydediliyor...' : '⭐ Değerlendir'}
        </button>
      </form>
    </div>
  );
}