import { redirect } from '@/i18n/routing';

export default function Home() {
  // Redirect to locale-aware login
  redirect('/login');
}
