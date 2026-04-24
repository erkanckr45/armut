'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Usta() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (status === 'loading') return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  const handleUstaOl = async () => {
    setLoading(true);
    const res = await fetch('/api/user/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'PROVIDER' }),
    });

    if (res.ok) {
      setMessage('✅ Tebrikler! Artık hizmet veren (usta) oldunuz!');
      setTimeout(() => router.refresh(), 2000);
    } else {
      setMessage('❌ Bir hata oluştu');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🛠️ Hizmet Veren Ol</h1>
      <p>Hizmet vermek için usta olarak kaydolun.</p>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      <button 
        onClick={handleUstaOl} 
        disabled={loading}
        style={{ padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
      >
        {loading ? 'İşleniyor...' : '🔨 Usta Ol'}
      </button>
    </div>
  );
}