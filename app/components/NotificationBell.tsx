'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    const fetchUnreadCount = async () => {
      const res = await fetch('/api/messages/unread-count');
      const data = await res.json();
      setUnreadCount(data.count);
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // 10 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, [session]);

  if (!session || unreadCount === 0) return null;

  return (
    <Link href="/mesajlarim" style={{ position: 'relative', marginRight: '15px', textDecoration: 'none' }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', position: 'relative' }}>
        💬
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-10px',
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
}