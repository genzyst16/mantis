import { redirect } from 'next/navigation';

export default function Home() {
  // We'll let the middleware handle redirecting unauthenticated users to /login,
  // but if they hit the root, we send them to /dashboard which the middleware
  // will intercept if they aren't logged in.
  redirect('/dashboard');
}
