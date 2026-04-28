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
  const [unreadOfferCount, setUnreadOfferCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  // Müşteri için okunmamış teklif sayısı
  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      fetch('/api/offers/unread')
        .then(res => res.json())
        .then(data => {
          setUnreadOfferCount(data.count || 0);
        });
    }
  }, [session]);

  // Usta için okunmamış mesaj sayısı
  useEffect(() => {
    if (session?.user?.role === 'PROVIDER') {
      fetch('/api/messages/unread')
        .then(res => res.json())
        .then(data => {
          setUnreadMessageCount(data.count || 0);
        });
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  }

  const userRole = (session?.user as any)?.role;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ color: '#007bff' }}>🚀 Armut Clone</h1>
        
        {session ? (
          <div>
            <span style={{ marginRight: '15px' }}>Hoş geldin, <strong>{session.user?.name}</strong></span>
            
            {/* MÜŞTERİ MENÜSÜ */}
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
                  <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', position: 'relative' }}>
                    📋 Gelen Teklifler
                    {unreadOfferCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {unreadOfferCount}
                      </span>
                    )}
                  </button>
                </Link>
              </>
            )}
            
            {/* USTA MENÜSÜ */}
            {userRole === 'PROVIDER' && (
              <>
                <Link href="/usta/profil">
                  <button style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    🛠️ Profilim
                  </button>
                </Link>
                <Link href="/isler">
                  <button style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', position: 'relative' }}>
                    📋 Açık İşler
                    {unreadMessageCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {unreadMessageCount}
                      </span>
                    )}
                  </button>
                </Link>
                <Link href="/tekliflerim">
                  <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    📋 Verdiğim Teklifler
                  </button>
                </Link>
                <Link href="/kazandigim-isler">
                  <button style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                    🏆 Kazandığım İşler
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

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f0f4f8' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Ne arıyorsunuz?</h2>
        <p style={{ fontSize: '18px', color: '#666' }}>Binlerce güvenilir hizmet veren arasında aradığını bul!</p>
      </div>

      {/* Kategoriler */}
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