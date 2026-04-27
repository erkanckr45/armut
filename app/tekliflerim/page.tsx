'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Tekliflerim() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/offers/my')
      .then(res => res.json())
      .then(data => {
        let teklifler = [];
        if (data.jobs && Array.isArray(data.jobs)) {
          teklifler = data.jobs.flatMap((job: any) => 
            (job.offers || []).map((offer: any) => ({
              ...offer,
              job: { id: job.id, title: job.title, description: job.description, status: job.status }
            }))
          );
        } else if (Array.isArray(data)) {
          teklifler = data;
        }
        setOffers(teklifler);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setOffers([]);
        setLoading(false);
      });
  }, []);

  const handleAccept = async (offerId: string, jobId: string) => {
    const res = await fetch('/api/offers/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, jobId }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Teklif kabul edildi! Artık mesajlaşabilirsiniz.');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  if (status === 'loading' || loading) return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  const userRole = session.user?.role;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{userRole === 'CUSTOMER' ? '📋 Gelen Teklifler' : '📋 Verdiğim Teklifler'}</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      {offers.length === 0 && <p>Henüz teklif bulunmuyor.</p>}
      
      {offers.map((offer: any) => (
        <div key={offer.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', marginBottom: '20px', background: '#f9f9f9' }}>
          <h3>{offer.job?.title || 'İş bulunamadı'}</h3>
          <p>{offer.job?.description || ''}</p>
          <p><strong>💰 Teklif Fiyatı:</strong> {offer.price} TL</p>
          <p><strong>💬 Mesaj:</strong> {offer.message}</p>
          
          {userRole === 'CUSTOMER' && offer.provider && (
            <p><strong>👤 Usta:</strong> {offer.provider.name}</p>
          )}
          
          <p><strong>📅 Tarih:</strong> {new Date(offer.createdAt).toLocaleDateString('tr-TR')}</p>
          
          {userRole === 'CUSTOMER' && offer.status === 'PENDING' && (
            <button 
              onClick={() => handleAccept(offer.id, offer.job.id)}
              style={{ marginTop: '10px', padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              ✅ Teklifi Kabul Et
            </button>
          )}
          
          {offer.status === 'ACCEPTED' && (
            <div>
              <p style={{ color: 'green', marginTop: '10px' }}>✅ Bu teklif kabul edildi. Artık mesajlaşabilirsiniz.</p>
              <Link href="/isler">
                <button style={{ marginTop: '10px', padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  💬 Mesaj Gönder
                </button>
              </Link>
            </div>
          )}
          
          {offer.status === 'REJECTED' && (
            <p style={{ color: 'red', marginTop: '10px' }}>❌ Bu teklif reddedildi.</p>
          )}
        </div>
      ))}
    </div>
  );
}