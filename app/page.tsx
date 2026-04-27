'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (session?.user?.role === 'PROVIDER') {
      fetch('/api/user/categories')
        .then(res => res.json())
        .then(data => {
          if (data.length === 0) {
            setShowWarning(true);
          }
        });
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  }

  const userRole = (session?.user as any)?.role;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {showWarning && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '12px 20px', textAlign: 'center', borderBottom: '1px solid #ffeeba' }}>
          ⚠️ Henüz hizmet kategorisi seçmediniz! 
          <Link href="/usta/profil" style={{ color: '#856404', fontWeight: 'bold', marginLeft: '10px' }}>
            Hemen kategorilerinizi seçin →
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ color: '#007bff' }}>🚀 Armut Clone</h1>
        
        {session ? (
          <div>
            <span style={{ marginRight: '15px' }}>Hoş geldin, <strong>{session.user?.name}</strong></span>
            
            <Link href="/profil/goster">
              <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                👤 Profilim
              </button>
            </Link>
            
            {userRole === 'PROVIDER' && (
              <Link href="/usta/profil">
                <button style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                  🛠️ Usta Profilim
                </button>
              </Link>
            )}
            
            {userRole === 'CUSTOMER' && (
              <>
                <Link href="/is-ver">
                  <button style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    + İş Ver
                  </button>
                </Link>
                <Link href="/isler">
                  <button style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    📋 Kendi İşlerim
                  </button>
                </Link>
                <Link href="/tekliflerim">
                  <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    📋 Gelen Teklifler
                  </button>
                </Link>
              </>
            )}
            
            {userRole === 'PROVIDER' && (
              <>
                <Link href="/aktif-islerim">
                  <button style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    📋 Aktif İşlerim
                  </button>
                </Link>
                <Link href="/isler">
                  <button style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    📋 Açık İşler
                  </button>
                </Link>
                <Link href="/tekliflerim">
                  <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    📋 Verdiğim Teklifler
                  </button>
                </Link>
              </>
            )}
            
            <button onClick={() => signOut()} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div>
            <Link href="/giris">
              <button style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                Giriş Yap
              </button>
            </Link>
            <Link href="/kayit">
              <button style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Kayıt Ol
              </button>
            </Link>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f0f4f8' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Ne arıyorsunuz?</h2>
        <p style={{ fontSize: '18px', color: '#666' }}>Binlerce güvenilir hizmet veren arasında aradığını bul!</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 20px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '30px' }}>Popüler Hizmetler</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/kategori/${cat.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ textAlign: 'center', padding: '25px 15px', background: '#fff', borderRadius: '10px', border: '1px solid #e0e0e0', cursor: 'pointer' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>{cat.icon || '📦'}</div>
                <div style={{ fontWeight: '500', color: '#333' }}>{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}