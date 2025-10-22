'use client'
import React from 'react';
import VirtualAIDemo from '@/components/VirtualAIDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  ArrowLeft, 
  CheckCircle, 
  Zap, 
  Video, 
  Mic, 
  MessageSquare,
  Star
} from 'lucide-react'
import Link from 'next/link';

const VirtualAIDemoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Virtual AI Interviewer Demo
                </h1>
                <p className="text-sm text-gray-500">
                  Experience the future of AI-powered interviews
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              REVOLUTIONARY
            </Badge>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Your Virtual AI Interviewer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience a revolutionary face-to-face interview with an AI that speaks, listens, 
              and responds just like a human interviewer. This is the future of interview preparation!
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center p-6 border-2 border-purple-200 bg-white/70">
              <Video className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-purple-800 mb-2">Face-to-Face</h3>
              <p className="text-sm text-gray-600">
                Interactive AI avatar with real-time visual feedback
              </p>
            </Card>
            
            <Card className="text-center p-6 border-2 border-blue-200 bg-white/70">
              <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Natural Speech</h3>
              <p className="text-sm text-gray-600">
                AI speaks questions using advanced text-to-speech
              </p>
            </Card>
            
            <Card className="text-center p-6 border-2 border-green-200 bg-white/70">
              <Mic className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-green-800 mb-2">Voice Recognition</h3>
              <p className="text-sm text-gray-600">
                Real-time speech-to-text for natural conversation
              </p>
            </Card>
            
            <Card className="text-center p-6 border-2 border-orange-200 bg-white/70">
              <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-orange-800 mb-2">Smart Follow-ups</h3>
              <p className="text-sm text-gray-600">
                Intelligent questions based on your responses
              </p>
            </Card>
          </div>

          {/* Demo Component */}
          <VirtualAIDemo />

          {/* How It Works */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">How the Virtual AI Interviewer Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">AI Speaks</h3>
                  <p className="text-sm text-gray-600">
                    The AI interviewer asks questions using natural speech synthesis, 
                    creating a realistic conversation experience.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">You Respond</h3>
                  <p className="text-sm text-gray-600">
                    Speak your answers naturally or type them. The AI uses advanced 
                    speech recognition to understand your responses.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">AI Follows Up</h3>
                  <p className="text-sm text-gray-600">
                    Based on your answer, the AI generates intelligent follow-up 
                    questions, just like a real interviewer would.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-purple-800">
                Why Choose Virtual AI Interviews?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Realistic Practice</h4>
                      <p className="text-sm text-gray-600">
                        Experience the pressure and flow of a real interview
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Immediate Feedback</h4>
                      <p className="text-sm text-gray-600">
                        Get real-time analysis and improvement suggestions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Natural Conversation</h4>
                      <p className="text-sm text-gray-600">
                        Practice speaking and listening skills simultaneously
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Adaptive Questions</h4>
                      <p className="text-sm text-gray-600">
                        AI adjusts difficulty and follow-ups based on your responses
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Comprehensive Analytics</h4>
                      <p className="text-sm text-gray-600">
                        Detailed conversation analysis and performance metrics
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Available 24/7</h4>
                      <p className="text-sm text-gray-600">
                        Practice anytime with your personal AI interviewer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Card className="p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready for Your Virtual AI Interview?</h3>
              <p className="text-lg mb-6 opacity-90">
                Experience the most advanced interview preparation technology available today
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary">
                    <Brain className="w-5 h-5 mr-2" />
                    Start Real Interview
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                    Create New Interview
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualAIDemoPage;