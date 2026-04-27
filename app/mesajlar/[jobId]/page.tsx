'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Mesajlasma() {
  const { jobId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // MESAJLARI YÜKLE
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?jobId=${jobId}`);
      const data = await res.json();
      setMessages(data);
      
      // Okunmamış mesajları işaretle
      const unreadMessages = data.filter((m: any) => !m.isRead && m.receiverId === session?.user?.id);
      if (unreadMessages.length > 0) {
        await fetch('/api/messages/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });
      }
    } catch (err) {
      console.error('Mesajlar alınamadı:', err);
    }
  };

  // HER 3 SANİYEDE BİR OTOMATİK YENİLE
  useEffect(() => {
    if (!jobId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  // YENİ MESAJ GELİNCE AŞAĞI KAYDIR
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setLoading(false);
  }, [messages]);

  // MESAJ GÖNDER
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error || 'Mesaj gönderilemedi');
      }
    } catch (err) {
      console.error('Hata:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href="/mesajlarim">
        <button style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
          ← Mesajlarım
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
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
          placeholder="Mesajınızı yazın..."
          disabled={sending}
          style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <button 
          onClick={sendMessage} 
          disabled={sending}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: sending ? 'not-allowed' : 'pointer' }}
        >
          {sending ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>
    </div>
  );
}