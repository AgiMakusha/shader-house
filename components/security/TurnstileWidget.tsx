"use client";

import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.warn('NEXT_PUBLIC_TURNSTILE_SITE_KEY not configured');
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'dark',
          size: 'normal',
        }}
      />
    </div>
  );
}

