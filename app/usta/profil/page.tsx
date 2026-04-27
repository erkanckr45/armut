'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function UstaProfilDuzenle() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setAllCategories(data));
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/categories')
        .then(res => res.json())
        .then(data => {
          const ids = data.map((c: any) => c.id);
          setSelectedCategories(ids);
        });

      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            bio: data.bio || '',
          });
        });
    }
  }, [session]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const catRes = await fetch('/api/user/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: selectedCategories }),
    });

    if (catRes.ok) {
      setMessage('✅ Profil ve kategoriler güncellendi!');
      await update();
      setTimeout(() => router.push('/'), 1500);
    } else {
      setMessage('❌ Bir hata oluştu');
    }
    setLoading(false);
  };

  if (status === 'loading') return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  if (session.user?.role !== 'PROVIDER') {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Bu sayfa sadece ustalar içindir.</p>
        <button onClick={() => router.push('/')}>Ana Sayfa</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🛠️ Usta Profil Düzenle</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ad Soyad</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telefon</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            placeholder="05XX XXX XX XX"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Hakkımda</label>
          <textarea 
            value={formData.bio} 
            onChange={e => setFormData({ ...formData, bio: e.target.value })} 
            rows={4}
            placeholder="Uzmanlık alanlarınız..."
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Hizmet Verdiğiniz Kategoriler</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {allCategories.map(cat => (
              <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                />
                <span>{cat.icon} {cat.name}</span>
              </label>
            ))}
          </div>
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