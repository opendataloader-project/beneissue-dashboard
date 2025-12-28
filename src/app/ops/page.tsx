import { redirect } from 'next/navigation';

// Redirect /ops to /dashboard (pages merged)
export default function Operations() {
  redirect('/dashboard');
}
