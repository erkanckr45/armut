'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Profil() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        phone: (session.user as any)?.phone || '',
        bio: (session.user as any)?.bio || '',
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Profil bilgileriniz güncellendi!');
        await update();
        setTimeout(() => {
          setMessage('');
          router.refresh();
        }, 2000);
      } else {
        setMessage(`❌ Hata: ${data.error || 'Bir şeyler yanlış gitti'}`);
      }
    } catch (error) {
      setMessage('❌ Bağlantı hatası, tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>👤 Profil Düzenle</h1>
        <button 
          onClick={() => router.push('/')}
          style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          🏠 Ana Sayfa
        </button>
      </div>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ad Soyad</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Telefon</label>
          <input 
            type="tel" 
            placeholder="05XX XXX XX XX" 
            value={formData.phone} 
            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hakkımda</label>
          <textarea 
            placeholder="Kendinizi tanıtın, uzmanlık alanlarınız..." 
            value={formData.bio} 
            onChange={e => setFormData({ ...formData, bio: e.target.value })} 
            rows={5}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Kaydediliyor...' : '💾 Profili Kaydet'}
        </button>
      </form>
    </div>
  );
}