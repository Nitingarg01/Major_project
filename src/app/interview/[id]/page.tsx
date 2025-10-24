'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VirtualAIInterviewer from '@/components/VirtualAIInterviewer';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [interview, setInterview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchInterview();
    }
  }, [status, params.id]);

  const fetchInterview = async () => {
    try {
      const response = await fetch(`/api/interviews/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInterview(data.interview);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching interview:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <VirtualAIInterviewer interview={interview} />
    </div>
  );
}
