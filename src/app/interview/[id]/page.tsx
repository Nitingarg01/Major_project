import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { ArrowLeft, Video } from 'lucide-react';
import VirtualAIInterviewer from '@/components/VirtualAIInterviewer';

export default async function InterviewPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { db } = await connectToDatabase();
  
  let interview;
  try {
    interview = await db.collection('interviews').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return <div>Interview not found</div>;
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Interview not found</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (interview.status === 'completed') {
    redirect(`/feedback/${params.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Mock Interview
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {interview.jobTitle} {interview.companyName && `at ${interview.companyName}`}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Exit Interview
          </Link>
        </div>

        <VirtualAIInterviewer
          interviewId={params.id}
          questions={interview.questions}
          currentQuestionIndex={interview.currentQuestionIndex || 0}
          jobTitle={interview.jobTitle}
          companyName={interview.companyName}
        />
      </div>
    </div>
  );
}
