import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Redirect /ops to /dashboard (pages merged)
export default function Operations() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
