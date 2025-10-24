'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, TrendingUp, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Interview {
  _id: string;
  jobTitle: string;
  companyName: string;
  interviewType: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchInterviews();
    }
  }, [status, router]);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
        
        // Calculate stats
        const total = data.interviews?.length || 0;
        const completed = data.interviews?.filter((i: Interview) => i.status === 'completed').length || 0;
        const pending = total - completed;
        
        setStats({ total, completed, pending });
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">Ready to practice your interview skills?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600" data-testid="stat-completed">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-orange-600" data-testid="stat-pending">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Create New Interview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Start a New Mock Interview</h2>
              <p className="text-blue-100">Practice with our AI virtual interviewer and get instant feedback</p>
            </div>
            <Link href="/interview/create">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                data-testid="create-interview-btn"
              >
                <Plus className="mr-2 w-5 h-5" />
                Create Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Interviews</h2>
            {stats.completed > 0 && (
              <Link href="/performance" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                View All Performance
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
              <p className="text-gray-600 mb-6">Create your first mock interview to get started</p>
              <Link href="/interview/create">
                <Button data-testid="first-interview-btn">
                  <Plus className="mr-2 w-4 h-4" />
                  Create Your First Interview
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div 
                  key={interview._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  data-testid={`interview-card-${interview._id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{interview.jobTitle}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {interview.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{interview.companyName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {interview.interviewType}
                        </span>
                      </div>
                    </div>
                    <Link href={interview.status === 'completed' ? `/performance/${interview._id}` : `/interview/${interview._id}`}>
                      <Button variant="outline" size="sm" data-testid={`view-interview-${interview._id}`}>
                        {interview.status === 'completed' ? 'View Results' : 'Continue'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
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
