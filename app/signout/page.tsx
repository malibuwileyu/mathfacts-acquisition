/**
 * Sign out page - Cognito redirects here after logout
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear demo mode if set
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('dev_mode');
    
    // Redirect to home after 1 second
    setTimeout(() => {
      router.push('/');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-bold text-gray-700">Signed Out</h1>
        <p className="text-gray-600 mt-2">Redirecting...</p>
      </div>
    </div>
  );
}


