'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotificationBell() {
  const { data: session } = useSession();
  const pathname = usePathname();
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
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000); // 3 saniyede bir kontrol
    return () => clearInterval(interval);
  }, [session]);

  // Mesajlar sayfasındayken bildirim simgesini gizleme
  if (!session || pathname === '/mesajlarim') return null;

  return (
    <Link href="/mesajlarim" style={{ position: 'relative', marginRight: '15px', textDecoration: 'none', display: 'inline-block' }}>
      <button style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '24px',
        position: 'relative',
        padding: '5px 10px'
      }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
}