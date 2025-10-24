import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Link from 'next/link';
import { Plus, Video, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's interviews
  const { db } = await connectToDatabase();
  const interviews = await db
    .collection('interviews')
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const pendingInterviews = interviews.filter(i => i.status === 'pending');
  const completedInterviews = interviews.filter(i => i.status === 'completed');

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
              <span className="text-sm text-gray-600">Welcome, {session.user.name || session.user.email}</span>
              <form action={async () => {
                'use server';
                const { signOut } = await import('@/app/auth');
                await signOut({ redirectTo: '/' });
              }}>
                <button
                  type="submit"
                  className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your mock interviews and track your progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingInterviews.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedInterviews.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Create New Interview Button */}
        <div className="mb-8">
          <Link
            href="/create"
            className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            data-testid="create-interview-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Interview
          </Link>
        </div>

        {/* Interviews List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Your Interviews</h2>
          </div>
          
          {interviews.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews yet</h3>
              <p className="text-gray-600 mb-6">Create your first mock interview to get started</p>
              <Link
                href="/create"
                className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Interview
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {interviews.map((interview: any) => (
                <div key={interview._id.toString()} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.jobTitle} {interview.companyName ? `at ${interview.companyName}` : ''}
                        </h3>
                        <span className={
                          interview.status === 'completed' 
                            ? 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium'
                            : 'px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium'
                        }>
                          {interview.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Created {new Date(interview.createdAt).toLocaleDateString()}
                        {interview.completedAt && ` • Completed ${new Date(interview.completedAt).toLocaleDateString()}`}
                      </p>
                      {interview.questions && (
                        <p className="text-sm text-gray-500 mt-1">
                          {interview.questions.length} questions
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {interview.status === 'pending' ? (
                        <Link
                          href={`/interview/${interview._id.toString()}`}
                          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          data-testid={`start-interview-${interview._id.toString()}`}
                        >
                          Start Interview
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      ) : (
                        <Link
                          href={`/feedback/${interview._id.toString()}`}
                          className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          data-testid={`view-feedback-${interview._id.toString()}`}
                        >
                          View Feedback
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
