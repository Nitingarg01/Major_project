'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Volume2, VolumeX, Video, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VirtualAIInterviewerProps {
  interview: any;
}

export default function VirtualAIInterviewer({ interview }: VirtualAIInterviewerProps) {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening'>('idle');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
          
          setUserResponse(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }

      // Speech Synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start interview
  const startInterview = async () => {
    setIsStarted(true);
    await generateFirstQuestion();
  };

  // Generate question using AI
  const generateFirstQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const response = await fetch('/api/interviews/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interview.interviewId,
          jobTitle: interview.jobTitle,
          companyName: interview.companyName,
          interviewType: interview.interviewType,
          experienceLevel: interview.experienceLevel,
          questionNumber: 1
        })
      });

      const data = await response.json();
      if (response.ok && data.question) {
        setQuestions([data.question]);
        speakQuestion(data.question);
      } else {
        toast.error('Failed to generate question');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      toast.error('Failed to generate question');
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Text-to-Speech
  const speakQuestion = (text: string) => {
    if (synthRef.current) {
      setIsSpeaking(true);
      setAvatarState('speaking');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
      };

      synthRef.current.speak(utterance);
    }
  };

  // Toggle listening (Speech-to-Text)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setAvatarState('listening');
    }
  };

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!userResponse.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    // Stop listening
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    // Save response
    const updatedResponses = [...responses, userResponse];
    setResponses(updatedResponses);

    // Move to next question or complete
    if (currentQuestionIndex < 4) { // 5 questions total
      setUserResponse('');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      await generateNextQuestion();
    } else {
      // Complete interview
      await completeInterview(updatedResponses);
    }
  };

  // Generate next question
  const generateNextQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const response = await fetch('/api/interviews/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interview.interviewId,
          jobTitle: interview.jobTitle,
          companyName: interview.companyName,
          interviewType: interview.interviewType,
          experienceLevel: interview.experienceLevel,
          questionNumber: currentQuestionIndex + 2,
          previousAnswers: responses
        })
      });

      const data = await response.json();
      if (response.ok && data.question) {
        setQuestions([...questions, data.question]);
        speakQuestion(data.question);
      }
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Complete interview
  const completeInterview = async (finalResponses: string[]) => {
    try {
      const response = await fetch('/api/interviews/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interview.interviewId,
          questions,
          responses: finalResponses
        })
      });

      if (response.ok) {
        toast.success('Interview completed! Generating feedback...');
        router.push(`/performance/${interview.interviewId}`);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Failed to complete interview');
    }
  };

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Video className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ready for Your Mock Interview?
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              <strong>{interview.jobTitle}</strong> at <strong>{interview.companyName}</strong>
            </p>
            <p className="text-gray-500 mb-8">
              Type: {interview.interviewType} | Level: {interview.experienceLevel}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Before we start:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>The AI interviewer will ask you 5 questions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Use your microphone to answer (or type your responses)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>The interview will take approximately 15-20 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>You'll receive instant feedback after completion</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={startInterview}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            data-testid="start-interview-btn"
          >
            Start Interview
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of 5</span>
          <span className="text-sm font-medium text-blue-600">{Math.round(((currentQuestionIndex + 1) / 5) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Virtual Avatar */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Interviewer</h3>
            
            {/* Avatar Animation */}
            <div className="relative mb-6">
              <div className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transition-all duration-300 ${
                avatarState === 'speaking' ? 'animate-pulse scale-110' : 
                avatarState === 'listening' ? 'ring-4 ring-green-400' : ''
              }`}>
                <Video className="w-24 h-24 text-white" />
              </div>
              
              {/* Speaking Indicator */}
              {isSpeaking && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
                  <div className="w-2 h-8 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-12 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-10 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              {isGeneratingQuestion ? (
                <p className="text-gray-600 animate-pulse">Thinking of a question...</p>
              ) : isSpeaking ? (
                <p className="text-blue-600 font-medium">Speaking...</p>
              ) : isListening ? (
                <p className="text-green-600 font-medium">Listening...</p>
              ) : (
                <p className="text-gray-600">Ready for your answer</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleListening}
                disabled={isSpeaking || isGeneratingQuestion}
                className={`rounded-full w-16 h-16 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                data-testid="toggle-mic-btn"
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
              <Button
                onClick={() => speakQuestion(questions[currentQuestionIndex])}
                disabled={!questions[currentQuestionIndex] || isSpeaking}
                variant="outline"
                className="rounded-full w-16 h-16"
                data-testid="repeat-question-btn"
              >
                {isSpeaking ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Question & Answer Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Question</h3>
            {questions[currentQuestionIndex] ? (
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-900 text-lg">
                  {questions[currentQuestionIndex]}
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-gray-500">Loading question...</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Start speaking or type your answer here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              data-testid="answer-textarea"
            />
            
            <div className="mt-6 flex justify-end gap-4">
              <Button
                onClick={submitAnswer}
                disabled={!userResponse.trim() || isGeneratingQuestion}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="submit-answer-btn"
              >
                {currentQuestionIndex < 4 ? 'Next Question' : 'Complete Interview'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
