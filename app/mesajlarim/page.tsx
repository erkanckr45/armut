'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Mesajlarim() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/my')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
  }, []);

  if (status === 'loading' || loading) return <div>Yükleniyor...</div>;
  if (!session) {
    router.push('/giris');
    return null;
  }

  const unreadCount = messages.filter((m: any) => !m.isRead).length;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>💬 Mesajlarım {unreadCount > 0 && `(${unreadCount} okunmamış)`}</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🏠 Ana Sayfa
          </button>
        </Link>
      </div>
      
      {messages.length === 0 && <p>Henüz mesajınız yok.</p>}
      
      {messages.map((msg: any) => (
        <Link key={msg.id} href={`/mesajlar/${msg.job.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '10px',
            background: msg.isRead ? '#fff' : '#e8f4ff',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{msg.job?.title || 'İş'}</h3>
              {!msg.isRead && <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>Yeni</span>}
            </div>
            <p style={{ margin: '5px 0' }}><strong>{msg.sender?.name}:</strong> {msg.content.substring(0, 100)}</p>
            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}