import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, Users, Zap, Shield, Clock, Target, Video, Brain, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Interview Coach - Master Your Next Interview',
  description: 'AI-powered virtual mock interviews with face-to-face AI avatar, instant feedback, and personalized coaching.',
};

const features = [
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Virtual AI Interviewer',
    description: 'Face-to-face conversation with an AI avatar that looks and speaks naturally'
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Smart Question Generation',
    description: 'AI customizes questions based on your resume and target role'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-time Feedback',
    description: 'Instant analysis and suggestions on your responses'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Performance Analytics',
    description: 'Detailed evaluation reports with improvement recommendations'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Resume-Based Prep',
    description: 'Upload your resume for personalized interview preparation'
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Progress Tracking',
    description: 'Track your improvement across multiple interview sessions'
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Interview Coach
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                data-testid="nav-login-link"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                data-testid="nav-get-started-btn"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Mock Interview Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Your Next Interview
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              With AI Virtual Coach
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice with a face-to-face AI interviewer, get instant feedback on your responses, 
            and receive personalized coaching based on your resume and target role.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/login"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center"
              data-testid="hero-start-btn"
            >
              Start Your First Interview
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">AI-Powered</div>
              <div className="text-gray-600">Virtual Interviewer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">Real-time</div>
              <div className="text-gray-600">Speech Recognition</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Instant</div>
              <div className="text-gray-600">Feedback & Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive tools for interview preparation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual AI Demo Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200 mb-6">
              <Video className="w-4 h-4 mr-2" />
              Revolutionary Technology
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Face-to-Face AI Interview Experience
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Natural conversations with an AI avatar that listens, responds, and evaluates just like a real interviewer
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Key Features:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Virtual AI Avatar</h4>
                    <p className="text-blue-100">Interactive avatar with natural speech and expressions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Speech-to-Text</h4>
                    <p className="text-blue-100">Real-time voice recognition for smooth conversation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Resume-Based Questions</h4>
                    <p className="text-blue-100">Customized questions based on your uploaded resume</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Instant Performance Evaluation</h4>
                    <p className="text-blue-100">Detailed feedback and improvement suggestions</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-800 to-blue-800 rounded-2xl p-8 border border-purple-400">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-2xl">
                    <Video className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">AI Interviewer Ready</h4>
                  <p className="text-purple-200 mb-4">Start your mock interview session now</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start practicing with our AI virtual interviewer today
          </p>
          
          <Link
            href="/login"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105"
            data-testid="cta-start-btn"
          >
            Start Your Free Interview
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold mb-4">AI Interview Coach</div>
          <p className="text-gray-400 mb-4">
            Your AI-powered virtual interview preparation platform
          </p>
          <p className="text-gray-500">&copy; 2024 AI Interview Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
