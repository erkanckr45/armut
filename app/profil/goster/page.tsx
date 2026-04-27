'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfilGoster() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === 'loading' || loading) return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>👤 Profilim</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '60px', marginBottom: '10px' }}>👤</div>
        <h2>{profile?.name}</h2>
        <p style={{ color: '#666' }}>{profile?.role === 'PROVIDER' ? '🛠️ Usta' : '📋 Müşteri'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>📧 E-posta:</strong> {profile?.email}</p>
        <p><strong>📞 Telefon:</strong> {profile?.phone || 'Belirtilmemiş'}</p>
        <p><strong>📝 Hakkımda:</strong> {profile?.bio || 'Henüz bilgi eklenmemiş.'}</p>
      </div>
      
      <Link href="/profil">
        <button style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          ✏️ Profili Düzenle
        </button>
      </Link>
    </div>
  );
}