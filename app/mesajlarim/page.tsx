'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string };
  job: { id: string; title: string };
}

export default function Mesajlarim() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages/my');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Mesajlar alınamadı:', err);
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

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>💬 Mesajlarım {unreadCount > 0 && `(${unreadCount} yeni)`}</h1>
        <Link href="/">
          <button style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
            Ana Sayfa
          </button>
        </Link>
      </div>

      {messages.length === 0 && <p>Henüz mesajınız yok.</p>}

      {messages.map(msg => (
        <Link key={msg.id} href={`/mesajlar/${msg.job.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '10px',
            background: msg.isRead ? '#fff' : '#e8f4ff',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{msg.job?.title || 'İş'}</strong>
              {!msg.isRead && <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>Yeni</span>}
            </div>
            <p><strong>{msg.sender?.name}:</strong> {msg.content.substring(0, 100)}</p>
            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}