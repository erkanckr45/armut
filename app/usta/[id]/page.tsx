'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: { name: string };
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
  reviews: Review[];
  _count: {
    jobs: number;
    offers: number;
  };
}

export default function UstaProfil() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (id) {
      fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  if (!profile) return <div>Kullanıcı bulunamadı</div>;

  const reviews = profile.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ← Ana Sayfa
          </button>
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '80px', marginBottom: '10px' }}>🛠️</div>
        <h1>{profile.name}</h1>
        <p style={{ color: '#666' }}>{profile.role === 'PROVIDER' ? 'Hizmet Veren (Usta)' : 'Müşteri'}</p>
        
        {reviews.length > 0 && (
          <div>
            <span style={{ fontSize: '24px', color: '#ffc107' }}>
              {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
            </span>
            <span style={{ marginLeft: '10px', color: '#666' }}>
              ({reviews.length} değerlendirme)
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'profile' ? '2px solid #007bff' : 'none',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
          }}
        >
          📝 Profil
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'reviews' ? '2px solid #007bff' : 'none',
            fontWeight: activeTab === 'reviews' ? 'bold' : 'normal'
          }}
        >
          ⭐ Yorumlar ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'stats' ? '2px solid #007bff' : 'none',
            fontWeight: activeTab === 'stats' ? 'bold' : 'normal'
          }}
        >
          📊 İstatistikler
        </button>
      </div>

      {activeTab === 'profile' && (
        <div>
          <p><strong>📧 E-posta:</strong> {profile.email}</p>
          <p><strong>📞 Telefon:</strong> {profile.phone || 'Belirtilmemiş'}</p>
          <p><strong>📝 Hakkımda:</strong> {profile.bio || 'Henüz bilgi eklenmemiş.'}</p>
          <p><strong>📅 Katılım Tarihi:</strong> {new Date(profile.createdAt).toLocaleDateString('tr-TR')}</p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <p>Henüz yorum yapılmamış.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                <div>
                  <span style={{ color: '#ffc107' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p>{review.comment}</p>
                <p style={{ fontSize: '12px', color: '#999' }}>- {review.reviewer.name}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <p><strong>📋 Toplam İş Sayısı:</strong> {profile._count?.jobs || 0}</p>
          <p><strong>📝 Toplam Teklif Sayısı:</strong> {profile._count?.offers || 0}</p>
          <p><strong>⭐ Ortalama Puan:</strong> {averageRating.toFixed(1)} / 5</p>
        </div>
      )}
    </div>
  );
}