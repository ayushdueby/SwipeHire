'use client';

import { useRouter } from 'next/navigation';
import { Button } from './Button';

export function BackButton({ label = 'Back' }: { label?: string }) {
  const router = useRouter();
  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()}>
      ← {label}
    </Button>
  );
}




