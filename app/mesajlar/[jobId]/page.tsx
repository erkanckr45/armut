'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Mesajlasma() {
  const { jobId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/messages?jobId=${jobId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
  }, [jobId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, content: newMessage }),
    });

    if (res.ok) {
      const message = await res.json();
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href="/">
        <button style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
          ← Ana Sayfa
        </button>
      </Link>
      
      <h1>💬 Mesajlaşma</h1>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', height: '400px', overflowY: 'auto', padding: '15px', marginBottom: '15px' }}>
        {messages.length === 0 && <p>Henüz mesaj yok.</p>}
        {messages.map((msg: any) => (
          <div key={msg.id} style={{ marginBottom: '10px', textAlign: msg.senderId === session?.user?.id ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', background: msg.senderId === session?.user?.id ? '#007bff' : '#e9ecef', color: msg.senderId === session?.user?.id ? 'white' : 'black', padding: '8px 12px', borderRadius: '10px', maxWidth: '70%' }}>
              <strong>{msg.sender?.name}</strong><br />
              {msg.content}
              <div style={{ fontSize: '10px', marginTop: '5px' }}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Mesajınızı yazın..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <button onClick={sendMessage} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Gönder
        </button>
      </div>
    </div>
  );
}