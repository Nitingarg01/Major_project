'use client'
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Brain,
  MessageSquare,
  Video,
  Zap
} from 'lucide-react'
import { toast } from 'sonner';

const VirtualAIDemo: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{
    speaker: 'ai' | 'user'
    message: string
    timestamp: Date
  }>>([])

  // Demo messages for the AI
  const demoMessages = [;
    "Hello! I'm your Virtual AI Interviewer. I'm excited to meet you today!",
    "Let's start with a simple question: Can you tell me about yourself?",
    "That's interesting! What motivated you to apply for this position?",
    "Great answer! How do you handle challenging situations at work?",
    "Thank you for sharing that. What are your biggest strengths?",
    "Excellent! Do you have any questions for me about the role or company?"
  ]

  const [messageIndex, setMessageIndex] = useState(0);

  // Initialize speech synthesis
  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setAiState('speaking');
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setAiState('idle');
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Start demo conversation
  const startDemo = () => {
    setIsActive(true);
    setMessageIndex(0);
    setConversation([]);
    
    // Welcome message
    const welcomeMsg = demoMessages[0];
    setCurrentMessage(welcomeMsg);
    speakMessage(welcomeMsg);
    
    setConversation([{
      speaker: 'ai',
      message: welcomeMsg,
      timestamp: new Date()
    }])
    
    toast.success('🤖 Virtual AI Interviewer activated!');
  }

  // Simulate user response
  const simulateUserResponse = () => {
    const userResponses = [;
      "I'm a software engineer with 5 years of experience in web development.",
      "I'm passionate about creating innovative solutions and this role aligns with my career goals.",
      "I break down complex problems into smaller parts and collaborate with my team to find solutions.",
      "I'm a quick learner, detail-oriented, and I work well under pressure.",
      "Yes, what opportunities are there for professional growth in this role?"
    ]
    
    if (messageIndex < userResponses.length) {
      const userMsg = userResponses[messageIndex];
      
      setConversation(prev => [...prev, {
        speaker: 'user',
        message: userMsg,
        timestamp: new Date()
      }])
      
      // AI thinking state
      setAiState('thinking');
      
      // After a delay, AI responds
      setTimeout(() => {
        if (messageIndex + 1 < demoMessages.length) {
          const nextAiMsg = demoMessages[messageIndex + 1];
          setCurrentMessage(nextAiMsg);
          speakMessage(nextAiMsg);
          
          setConversation(prev => [...prev, {
            speaker: 'ai',
            message: nextAiMsg,
            timestamp: new Date()
          }])
          
          setMessageIndex(prev => prev + 1);
        } else {
          // End of demo
          const endMsg = "Thank you for this great conversation! This concludes our demo interview.";
          setCurrentMessage(endMsg);
          speakMessage(endMsg);
          
          setConversation(prev => [...prev, {
            speaker: 'ai',
            message: endMsg,
            timestamp: new Date()
          }])
          
          setTimeout(() => {
            setIsActive(false);
            toast.success('🎉 Demo completed! Ready to try the real Virtual AI Interview?');
          }, 3000)
        }
      }, 2000)
    }
  }

  // Simulate listening
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setAiState('listening');
      toast.info('🎤 AI is listening... (Demo mode - click "Simulate Response")');
    } else {
      setIsListening(false);
      setAiState('idle');
    }
  }

  // Stop demo
  const stopDemo = () => {
    setIsActive(false);
    setAiState('idle');
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentMessage('');
    setConversation([]);
    setMessageIndex(0);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    
    toast.info('Demo stopped');
  }

  // AI Avatar Component
  const AIAvatar = () => (;
    <div className="relative w-40 h-40 mx-auto mb-6">
      <div className={`w-full h-full rounded-full border-4 transition-all duration-500 ${
        aiState === 'speaking' ? 'border-green-400 animate-pulse shadow-lg shadow-green-200' :
        aiState === 'listening' ? 'border-blue-400 animate-pulse shadow-lg shadow-blue-200' :
        aiState === 'thinking' ? 'border-yellow-400 animate-spin shadow-lg shadow-yellow-200' :
        'border-purple-300 shadow-lg shadow-purple-100'
      } bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center`}>
        <Bot className={`w-20 h-20 text-white transition-all duration-300 ${
          aiState === 'speaking' ? 'scale-110 animate-bounce' :
          aiState === 'thinking' ? 'animate-pulse' :
          'scale-100'
        }`} />
      </div>
      
      {/* Animated rings for speaking */}
      {aiState === 'speaking' && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-30"></div>
          <div className="absolute inset-2 rounded-full border-2 border-green-400 animate-ping opacity-40 animation-delay-150"></div>
        </>
      )}
      
      {/* Status indicator */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
        <Badge variant={
          aiState === 'speaking' ? 'default' :
          aiState === 'listening' ? 'secondary' :
          aiState === 'thinking' ? 'outline' :
          'secondary'
        } className={`text-sm px-3 py-1 ${
          aiState === 'speaking' ? 'bg-green-500 animate-pulse' :
          aiState === 'listening' ? 'bg-blue-500 animate-pulse' :
          aiState === 'thinking' ? 'bg-yellow-500 animate-pulse' :
          'bg-purple-500'
        }`}>
          {aiState === 'speaking' ? '🗣️ Speaking' :
           aiState === 'listening' ? '👂 Listening' :
           aiState === 'thinking' ? '🤔 Thinking' :
           '😊 Ready'}
        </Badge>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800 flex items-center justify-center gap-2">
            <Brain className="w-8 h-8" />
            Virtual AI Interviewer Demo
          </CardTitle>
          <p className="text-purple-600">
            Experience face-to-face conversation with our AI interviewer
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Avatar */}
          <AIAvatar />
          
          {/* Current AI Message */}
          <Card className="bg-white/70 border border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Bot className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-purple-800 mb-1">AI Interviewer</div>
                  <div className="text-gray-700">
                    {currentMessage || "Hello! I'm ready to start our interview demo. Click 'Start Demo' to begin!"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <Button 
                onClick={startDemo}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Demo
              </Button>
            ) : (
              <>
                <Button
                  variant={isListening ? "destructive" : "default"}
                  onClick={toggleListening}
                  disabled={isSpeaking}
                >
                  {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </Button>
                
                <Button
                  onClick={simulateUserResponse}
                  disabled={!isListening || messageIndex >= demoMessages.length - 1}
                  variant="outline"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Simulate Response
                </Button>
                
                <Button
                  onClick={stopDemo}
                  variant="outline"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Demo
                </Button>
              </>
            )}
          </div>

          {/* Features Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="p-4 bg-white/50">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Face-to-Face Experience
              </h4>
              <p className="text-sm text-gray-600">
                Interactive AI avatar that responds to conversation with visual feedback and animations.
              </p>
            </Card>
            
            <Card className="p-4 bg-white/50">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Natural Speech
              </h4>
              <p className="text-sm text-gray-600">
                AI speaks questions and responses using advanced text-to-speech technology.
              </p>
            </Card>
            
            <Card className="p-4 bg-white/50">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Voice Recognition
              </h4>
              <p className="text-sm text-gray-600">
                Real-time speech-to-text conversion for natural conversation flow.
              </p>
            </Card>
            
            <Card className="p-4 bg-white/50">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Intelligent Follow-ups
              </h4>
              <p className="text-sm text-gray-600">
                AI generates contextual follow-up questions based on your responses.
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {conversation.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      entry.speaker === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {entry.speaker === 'ai' ? (
                        <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 mt-1 flex-shrink-0 bg-white rounded-full"></div>
                      )}
                      <div className="text-sm">{entry.message}</div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VirtualAIDemo;