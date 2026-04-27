'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Mesajlarim() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages/my');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  const unreadCount = messages.filter((m: any) => !m.isRead).length;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>📬 Mesajlarım {unreadCount > 0 && `(${unreadCount} yeni)`}</h1>
        <Link href="/"><button>🏠 Ana Sayfa</button></Link>
      </div>
      {messages.length === 0 && <p>📭 Henüz mesaj yok.</p>}
      {messages.map((msg: any) => (
        <Link key={msg.id} href={`/mesajlar/${msg.job?.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '10px',
            background: msg.isRead ? '#fff' : '#e6f7ff'
          }}>
            <b>{msg.job?.title}</b><br />
            <b>{msg.sender?.name}:</b> {msg.content?.substring(0, 80)}<br />
            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}