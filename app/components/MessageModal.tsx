'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  sender: { name: string };
  createdAt: string;
}

export default function MessageModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Mesajları yükle
  useEffect(() => {
    fetch(`/api/messages?jobId=${jobId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Mesajlar yüklenemedi:', err);
        setLoading(false);
      });
  }, [jobId]);

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: jobId, 
          content: newMessage 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages([...messages, data]);
        setNewMessage('');
      } else {
        alert('Mesaj gönderilemedi: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        width: '500px',
        maxWidth: '90%',
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ 
          padding: '15px', 
          borderBottom: '1px solid #ddd', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>💬 Mesajlaşma</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '20px', 
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            ✖
          </button>
        </div>
        
        {/* Mesajlar */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Yükleniyor...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Henüz mesaj yok. İlk mesajı sen gönder!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: '15px' }}>
                <div style={{
                  display: 'inline-block',
                  background: '#007bff',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  maxWidth: '70%',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {msg.sender?.name || 'Kullanıcı'}
                  </div>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Mesaj yazma alanı */}
        <div style={{ 
          padding: '15px', 
          borderTop: '1px solid #ddd', 
          display: 'flex', 
          gap: '10px' 
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
            placeholder="Mesajınızı yazın..."
            disabled={sending}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={sendMessage} 
            disabled={sending || !newMessage.trim()}
            style={{ 
              padding: '10px 20px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.6 : 1
            }}
          >
            {sending ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}