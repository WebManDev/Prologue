'use client';

import { CoachDashboard } from '@/components/coach-dashboard';
import { useRouter } from 'next/navigation';

export default function CoachDashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // You can add any additional logout logic here
    router.push('/'); // Redirect to home page after logout
  };

  return (
    <div className="min-h-screen bg-background">
      <CoachDashboard onLogout={handleLogout} />
    </div>
  );
} 