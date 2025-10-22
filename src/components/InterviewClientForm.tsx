import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Form } from './ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import QuestionAns from './QuestionAns';
import { Button } from './ui/button';
import { setAnswers } from '@/app/interview/[id]/perform/actions';
import { Question } from '@/types/interview';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { SubmittingLoadingSpinner } from './ui/loading-spinner';

const schema = z.object({
    submitted: z.array(z.record(z.string(), z.string().min(10, 'Please provide a more detailed answer')))
})

interface InterviewClientFormProps {
    questions: Question[]
    id: string
    roundId?: string
    onRoundComplete?: (answers: string[], timeSpent: number) => void
}

const InterviewClientForm: React.FC<InterviewClientFormProps> = ({ 
    questions, 
    id, 
    roundId,
    onRoundComplete 
}) => {
    const TOTAL_TIME = 30 * 60 // 30 minutes in seconds
    
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
    const [startTime] = useState(Date.now());

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            submitted: Array(questions.length).fill({ 'answer': "" })
        }
    })

    const router = useRouter();

    const handleSubmit = useCallback(async (data: z.infer<typeof schema>) => {
        if (isSubmitting) return

        setIsSubmitting(true);
        
        try {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const answers = data.submitted.map(item => item.answer);
            
            // If this is part of a multi-round interview
            if (onRoundComplete) {
                onRoundComplete(answers, timeSpent);
                toast.success("Round completed! Moving to next round...");
                return
            }

            // Traditional single round interview with timeout protection
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
            })

            const submitPromise = setAnswers(data.submitted, id);

            const result = await Promise.race([submitPromise, timeoutPromise]);
            
            toast.success("Answers submitted successfully!");
            
            // Generate fast feedback immediately
            try {
                toast.info("⚡ Generating AI feedback...");
                
                const feedbackResponse = await fetch('/api/fast-feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interviewId: id })
                });
                
                if (feedbackResponse.ok) {
                    const feedbackData = await feedbackResponse.json();
                    toast.success(`✅ Feedback ready in ${feedbackData.performance?.processingTime || 0}ms!`);
                } else {
                    console.warn('Fast feedback generation failed, will use fallback');
                }
            } catch (feedbackError) {
                console.warn('Fast feedback error:', feedbackError);
                // Continue anyway, feedback page will handle it
            }
            
            // Redirect to feedback immediately
            setTimeout(() => {
                router.push(`/interview/${id}/feedback`);
            }, 1000)
            
        } catch (error: any) {
            console.error('Submission error:', error);
            
            let errorMessage = "Failed to submit answers. Please try again.";
            if (error.message === 'Request timeout') {
                errorMessage = "Submission is taking longer than expected. Please check your connection and try again.";
            } else if (error.response?.status === 500) {
                errorMessage = "Server error occurred. Your answers may have been saved. Please check your interview status.";
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, onRoundComplete, id, router, startTime])

    const onSubmit = form.handleSubmit(handleSubmit);

    // Auto-submit when time runs out
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!isSubmitting) {
                        const formData = form.getValues();
                        handleSubmit(formData);
                    }
                    return 0;
                }
                return prev - 1;
            })
        }, 1000)

        return () => clearInterval(timer);
    }, [form, handleSubmit, isSubmitting])

    // Check if current question is answered
    useEffect(() => {
        const watchForm = form.watch((value) => {
            const currentAnswer = value.submitted?.[currentQuestion]?.answer || '';
            const newCompleted = new Set(completedQuestions);
            
            if (currentAnswer.trim().length >= 10) {
                newCompleted.add(currentQuestion);
            } else {
                newCompleted.delete(currentQuestion);
            }
            
            setCompletedQuestions(newCompleted);
        })
        
        return () => watchForm.unsubscribe();
    }, [form, currentQuestion, completedQuestions])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const getTimeColor = () => {
        if (timeLeft <= 300) return 'text-red-600 bg-red-50 border-red-200' // Last 5 minutes
        if (timeLeft <= 600) return 'text-yellow-600 bg-yellow-50 border-yellow-200' // Last 10 minutes
        return 'text-green-600 bg-green-50 border-green-200';
    }

    const canSubmit = completedQuestions.size >= Math.ceil(questions.length * 0.7) // At least 70% answered

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header with Timer and Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getTimeColor()}`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Question {currentQuestion + 1} of {questions.length}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {completedQuestions.size}/{questions.length} Answered
                        </Badge>
                        {timeLeft <= 300 && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Time running out!</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedQuestions.size / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={onSubmit} className='space-y-6'>
                    <Tabs value={currentQuestion.toString()} onValueChange={(value) => setCurrentQuestion(parseInt(value))}>
                        {/* Question Navigation */}
                        <TabsList className="grid grid-cols-5 md:grid-cols-10 gap-1 bg-gray-100 p-1">
                            {questions.map((_, index) => (
                                <TabsTrigger 
                                    key={index}
                                    value={index.toString()} 
                                    className={`
                                        relative text-sm
                                        ${completedQuestions.has(index) ? 'bg-green-100 text-green-800' : ''}
                                        ${index === currentQuestion ? 'ring-2 ring-blue-500' : ''}
                                    `}
                                >
                                    Q{index + 1}
                                    {completedQuestions.has(index) && (
                                        <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Question Content */}
                        {questions.map((question, index) => (
                            <TabsContent key={index} value={index.toString()} className="mt-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <QuestionAns 
                                        question={question} 
                                        form={form} 
                                        index={index}
                                    />
                                    
                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                            disabled={currentQuestion === 0}
                                        >
                                            ← Previous
                                        </Button>
                                        
                                        <div className="text-sm text-gray-500">
                                            {completedQuestions.has(index) ? (
                                                <span className="text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Answered
                                                </span>
                                            ) : (
                                                <span>Answer this question to continue</span>
                                            )}
                                        </div>
                                        
                                        {currentQuestion < questions.length - 1 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                            >
                                                Next →
                                            </Button>
                                        ) : (
                                            <div className="w-20"></div> // Spacer
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Submit Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Ready to Submit?</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {canSubmit ? (
                                        <span className="text-green-600">✓ You've answered enough questions to submit</span>
                                    ) : (
                                        <span className="text-yellow-600">
                                            Answer at least {Math.ceil(questions.length * 0.7)} questions before submitting
                                        </span>
                                    )}
                                </p>
                            </div>
                            <Button 
                                type='submit' 
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isSubmitting || !canSubmit}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Submit Interview
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default InterviewClientForm;

