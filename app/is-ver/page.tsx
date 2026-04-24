'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function IsVer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    city: '',
    district: '',
    budget: '',
  });

  // Kategorileri yükle
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  if (status === 'loading') return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.categoryId) {
      setMessage('❌ Lütfen bir kategori seçin');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        budget: parseFloat(formData.budget) || null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ İş talebiniz oluşturuldu!');
      setFormData({ title: '', categoryId: '', description: '', city: '', district: '', budget: '' });
    } else {
      setMessage(`❌ Hata: ${data.error || 'Bir şeyler yanlış gitti'}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📝 İş Ver</h1>
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="İş başlığı" 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
        />
        
        <select 
          value={formData.categoryId} 
          onChange={e => setFormData({ ...formData, categoryId: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        >
          <option value="">Kategori seçin</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        
        <textarea 
          placeholder="Açıklama" 
          value={formData.description} 
          onChange={e => setFormData({ ...formData, description: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '100px' }} 
        />
        
        <input 
          type="text" 
          placeholder="Şehir" 
          value={formData.city} 
          onChange={e => setFormData({ ...formData, city: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
        />
        
        <input 
          type="text" 
          placeholder="İlçe" 
          value={formData.district} 
          onChange={e => setFormData({ ...formData, district: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
        />
        
        <input 
          type="number" 
          placeholder="Bütçe (₺)" 
          value={formData.budget} 
          onChange={e => setFormData({ ...formData, budget: e.target.value })} 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
        />
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Oluşturuluyor...' : 'İş Ver'}
        </button>
      </form>
    </div>
  );
}