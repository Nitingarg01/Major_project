import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Star, Users, Zap, Shield, Clock, Target } from 'lucide-react'

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'RecruiterAI - Advanced AI Interview Platform',
=======
  title: 'Interview AI - Advanced AI Interview Platform',
>>>>>>> e191508 (Initial commit)
  description: 'Master your interview skills with AI-powered mock interviews, real-time feedback, and personalized coaching.',
}

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'AI-Powered Questions',
    description: 'Smart question generation based on job roles, companies, and recent industry trends'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Company Intelligence',
    description: 'Real-time company data, recent news, and culture insights for targeted preparation'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Performance Analytics',
    description: 'Detailed feedback on your responses with improvement suggestions and scoring'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Realistic Simulation',
    description: 'Camera monitoring, time tracking, and authentic interview environment'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Multi-Format Support',
    description: 'Technical, behavioral, DSA coding, and mixed interview formats'
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Instant Results',
    description: 'Get immediate feedback and detailed performance reports after each session'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
<<<<<<< HEAD
    content: 'RecruiterAI helped me prepare for my Google interview. The company-specific questions were incredibly accurate!',
=======
    content: 'Interview AI helped me prepare for my Google interview. The company-specific questions were incredibly accurate!',
>>>>>>> e191508 (Initial commit)
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Product Manager at Microsoft',
    content: 'The real-time feedback and performance analytics made all the difference in my interview preparation.',
    rating: 5
  },
  {
    name: 'Emily Johnson',
    role: 'Data Scientist at Amazon',
    content: 'I love how the platform adapts to different companies and roles. Got my dream job after practicing here!',
    rating: 5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
<<<<<<< HEAD
                RecruiterAI
=======
                Interview AI
>>>>>>> e191508 (Initial commit)
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
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
<<<<<<< HEAD
              <span className="font-bold text-xl">Advanced AI Interview Platform</span>
=======
              <span className="font-bold text-xl">Advanced Interview AI Platform</span>
>>>>>>> e191508 (Initial commit)
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Your Next
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Interview
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice with AI-powered mock interviews, get real-time feedback, and prepare with company-specific questions. 
            Land your dream job with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center"
            >
              Start Practicing Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <Link
              href="/demo"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              Watch Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Interviews Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Companies Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
<<<<<<< HEAD
              Our comprehensive AI interview platform provides all the tools and insights you need to ace your next interview.
=======
              Our comprehensive Interview AI platform provides all the tools and insights you need to ace your next interview.
>>>>>>> e191508 (Initial commit)
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

<<<<<<< HEAD
=======
      {/* Virtual AI Demo Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              <span className="font-bold">NEW: Revolutionary Technology</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Meet Your Virtual AI Interviewer
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience the future of interview preparation with face-to-face AI conversations that feel completely natural.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Revolutionary Features:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Face-to-Face Conversation</h4>
                    <p className="text-blue-100">Interactive AI avatar that speaks and listens just like a human interviewer</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Natural Speech Recognition</h4>
                    <p className="text-blue-100">Real-time voice-to-text conversion for seamless conversation flow</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Intelligent Follow-ups</h4>
                    <p className="text-blue-100">AI generates contextual questions based on your responses</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Real-time Analysis</h4>
                    <p className="text-blue-100">Immediate feedback and performance evaluation during conversation</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  href="/virtual-ai-demo"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  Try Virtual AI Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                
                <Link
                  href="/signup"
                  className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-purple-900 transition-all flex items-center justify-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-800 to-blue-800 rounded-2xl p-8 border border-purple-400">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-2xl">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-2">AI Interviewer Ready</h4>
                  <p className="text-purple-200 mb-4">Click demo to experience face-to-face AI conversation</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

>>>>>>> e191508 (Initial commit)
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
<<<<<<< HEAD
              See how RecruiterAI helped professionals land their dream jobs
=======
              See how Interview AI helped professionals land their dream jobs
>>>>>>> e191508 (Initial commit)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
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
<<<<<<< HEAD
            Join thousands of professionals who've successfully prepared with RecruiterAI
=======
            Join thousands of professionals who've successfully prepared with Interview AI
>>>>>>> e191508 (Initial commit)
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Start Your Free Interview
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
<<<<<<< HEAD
              <div className="text-2xl font-bold mb-4">RecruiterAI</div>
              <p className="text-gray-400">
                The most advanced AI interview platform for career success.
=======
              <div className="text-2xl font-bold mb-4">Interview AI</div>
              <p className="text-gray-400">
                The most advanced Interview AI platform for career success.
>>>>>>> e191508 (Initial commit)
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
<<<<<<< HEAD
            <p>&copy; 2024 RecruiterAI. All rights reserved.</p>
=======
            <p>&copy; 2024 Interview AI. All rights reserved.</p>
>>>>>>> e191508 (Initial commit)
          </div>
        </div>
      </footer>
    </div>
  )
}