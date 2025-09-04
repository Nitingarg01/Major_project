import Image from "next/image";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import Link from "next/link";
import { getUserInterviews } from "./actions";
import InterviewCard from "@/components/InterviewCard";
import Sidebar from "@/components/Sidebar";
import { Sparkles, Target, Users, Zap } from "lucide-react";

type User = {
  name: string,
  email: string,
  id: string,
}

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login')
  }
  const user = session?.user as User
  const interviews = await getUserInterviews()

  if (!interviews) {
    return <>Loading...</>
  }

  return (
    <div className="flex flex-row gap-1 w-full min-h-screen">
      <div className="w-[15%] h-screen bg-gray-50 sticky top-0">
        <Sidebar credits={0} id={user?.id} />
      </div>

      <div className="mx-4 flex flex-col gap-6 mt-6 w-[85%]">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl">
              AI Interview Practice Platform
            </span>
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Practice for interviews and ace the real ones with AI-powered mock interviews, 
            real-time feedback, and comprehensive performance analysis.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">Multi-Round Interviews</h3>
              <p className="text-sm text-blue-700">Technical, Behavioral, DSA & Aptitude</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">AI-Powered Feedback</h3>
              <p className="text-sm text-green-700">Real-time analysis & improvement tips</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">Company Specific</h3>
              <p className="text-sm text-purple-700">Practice for your dream companies</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <Sparkles className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-orange-800">Resume Analyzer</h3>
              <p className="text-sm text-orange-700">AI-powered resume scoring & tips</p>
            </div>
          </div>

          {/* Free Badge */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full inline-block mb-6">
            <span className="font-bold text-xl">🎉 100% FREE - No Credits Required!</span>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Interview Sessions</h2>
              <p className="text-gray-600">Track your progress and continue practicing</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="px-6 py-3 text-lg">
                <Link href='/resume-analyzer' className="flex flex-row gap-2 items-center">
                  <Sparkles className="w-5 h-5" />
                  Resume Analyzer
                </Link>
              </Button>
              <Button variant="default" className="px-6 py-3 text-lg">
                <Link href='/create' className="flex flex-row gap-2 items-center">
                  <IoMdAdd className="w-5 h-5" />
                  Create New Interview
                </Link>
              </Button>
            </div>
          </div>

          {/* Interview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.length > 0 ? (
              interviews.map((interview, index) => (
                <InterviewCard interview={interview} key={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No interviews yet</h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first mock interview session
                  </p>
                  <Button asChild>
                    <Link href='/create' className="flex items-center gap-2">
                      <IoMdAdd className="w-4 h-4" />
                      Create Your First Interview
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}