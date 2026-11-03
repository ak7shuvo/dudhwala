'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEMO_BRANDING } from '@/components/developer-credit';
import { DemoCheckout } from '@/components/demo-checkout';
import { OtpLogin } from '@/components/otp-login';

/**
 * Live shop: ordering needs a customer session. Use the existing one, else open an anonymous guest session
 * (API: POST /auth/guest, enabled by GUEST_CHECKOUT=true). If guest checkout is off, fall back to mobile OTP.
 * The local demo (mock API, no login) keeps rendering the checkout form directly.
 */
function Gate() {
  const [state, setState] = useState<'loading' | 'ready' | 'otp'>('loading');
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        await api('/me');
        if (!off) setState('ready');
        return;
      } catch {
        /* not signed in: try a guest session */
      }
      try {
        await api('/auth/guest', { method: 'POST', body: {} });
        if (!off) setState('ready');
      } catch {
        if (!off) setState(DEMO_BRANDING ? 'ready' : 'otp');
      }
    })();
    return () => {
      off = true;
    };
  }, []);
  if (state === 'loading') return <p className="pt-10 text-center">লোড হচ্ছে…</p>;
  if (state === 'otp')
    return (
      <div className="mx-auto max-w-md pt-8">
        <p className="mb-3 text-sm text-muted">অর্ডার দিতে আপনার মোবাইল নম্বর যাচাই করুন।</p>
        <OtpLogin onDone={() => setState('ready')} />
      </div>
    );
  return <DemoCheckout />;
}

export default function CheckoutPage() {
  return <Gate />;
}
