import React from 'react';
import { auth } from '../auth';
import { redirect } from 'next/navigation';
import UserPreferencesManager from '@/components/UserPreferencesManager';

const PreferencesPage = async () => {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserPreferencesManager showTitle={true} />
      </div>
    </div>
  );
};

export default PreferencesPage;