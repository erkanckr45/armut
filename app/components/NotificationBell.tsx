'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/messages/unread-count');
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Bildirim hatası:', err);
    }
  };

  useEffect(() => {
    if (!session) return;
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  return (
    <Link href="/mesajlarim" style={{ position: 'relative', display: 'inline-block', marginRight: '15px', textDecoration: 'none' }}>
      <span style={{ fontSize: '24px', cursor: 'pointer' }}>
        💬
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-12px',
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </span>
    </Link>
  );
}