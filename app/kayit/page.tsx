'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Kayit() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/kayit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/giris');
    } else {
      setError(data.error || 'Kayıt başarısız');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Kayıt Ol</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <input
          type="text"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Kayıt Ol
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Zaten hesabın var mı? <a href="/giris" style={{ color: '#007bff' }}>Giriş Yap</a>
        </p>
      </form>
    </div>
  );
}