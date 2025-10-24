'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  type: string;
  difficulty: string;
  expectedPoints: string[];
  order: number;
  response?: string;
}

interface VirtualAIInterviewerProps {
  interviewId: string;
  questions: Question[];
  currentQuestionIndex: number;
  jobTitle: string;
  companyName?: string;
}

export default function VirtualAIInterviewer({
  interviewId,
  questions,
  currentQuestionIndex: initialIndex,
  jobTitle,
  companyName
}: VirtualAIInterviewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    // Speak the first question when component mounts
    if (currentQuestion) {
      speakText(`Hello! Let's begin your interview for the ${jobTitle} position${companyName ? ` at ${companyName}` : ''}. ${currentQuestion.question}`);
    }
  }, []);

  const speakText = async (text: string) => {
    if (!aiEnabled) return;
    
    setIsSpeaking(true);
    
    try {
      // Try ElevenLabs first if available
      if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => setIsSpeaking(false);
          await audioRef.current.play();
          return;
        }
      }
    } catch (error) {
      console.log('ElevenLabs not available, using browser TTS');
    }
    
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setResponse(prev => prev + finalTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      alert('Please provide a response before submitting.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save response and get instant feedback
      const res = await fetch('/api/interviews/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          questionIndex: currentIndex,
          response: response.trim()
        })
      });

      const data = await res.json();
      
      if (data.feedback) {
        setFeedback(data.feedback);
        setShowFeedback(true);
        
        // Speak feedback
        await speakText(`Here's my feedback: ${data.feedback}`);
      }

    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = async () => {
    setShowFeedback(false);
    setFeedback('');
    setResponse('');
    
    if (isLastQuestion) {
      // Complete interview
      try {
        const res = await fetch('/api/interviews/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId })
        });

        if (res.ok) {
          await speakText('Congratulations! You have completed the interview. Generating your detailed performance report.');
          setTimeout(() => {
            router.push(`/feedback/${interviewId}`);
          }, 3000);
        }
      } catch (error) {
        console.error('Error completing interview:', error);
      }
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      await speakText(`Next question. ${nextQuestion.question}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* AI Avatar Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Virtual AI Interviewer</h2>
            <p className="text-indigo-100">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title={aiEnabled ? 'Mute AI' : 'Unmute AI'}
          >
            {aiEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
          </button>
        </div>
        
        {/* AI Avatar */}
        <div className="flex justify-center mb-6">
          <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/10 border-4 border-white/30 flex items-center justify-center ${
            isSpeaking ? 'animate-pulse' : ''
          }`}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
              <span className="text-4xl">🤖</span>
            </div>
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping" />
            )}
          </div>
        </div>
        
        {/* Current Question */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-start justify-between mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
              {currentQuestion.type} • {currentQuestion.difficulty}
            </span>
          </div>
          <p className="text-xl text-white font-medium leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>
      </div>

      {/* Response Section */}
      <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Response</h3>
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || showFeedback}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </button>
        </div>
        
        {!showFeedback ? (
          <>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Click 'Start Recording' to speak your answer, or type it here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4"
              disabled={isProcessing}
            />
            
            {isListening && (
              <div className="mb-4 flex items-center text-red-600 text-sm">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2" />
                Recording in progress...
              </div>
            )}
            
            <button
              onClick={handleSubmitResponse}
              disabled={isProcessing || !response.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Response...
                </>
              ) : (
                'Submit Response'
              )}
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">Instant Feedback</h4>
                  <p className="text-green-800 leading-relaxed">{feedback}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
            >
              {isLastQuestion ? (
                <>
                  Complete Interview
                  <CheckCircle className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
