'use client'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Push page view to Payload Analytics
    fetch('/api/site-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        path: pathname,
        // user: id (if you know they are logged in)
      })
    }).catch(() => {}); // Fail silently, analytics should never break UX
  }, [pathname]);

  return null;
}