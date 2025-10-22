'use client'
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Clock, Brain, CheckCircle, XCircle, AlertTriangle, Calculator, BookOpen, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface AptitudeQuestion {
  id: string
  type: 'verbal' | 'numerical' | 'logical' | 'spatial' | 'abstract'
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number // in seconds
  image?: string // for visual questions
}

interface AptitudeQuizProps {
  questions: AptitudeQuestion[]
  onComplete: (results: any) => void
  timeLimit?: number // total time in minutes
}

const AptitudeQuiz: React.FC<AptitudeQuizProps> = ({ 
  questions, 
  onComplete, 
  timeLimit = 30 
}) => {
  // Validate and filter questions to ensure they have required properties
  const validQuestions = questions.filter(q => 
    q && q.type && q.difficulty && q.question && q.options
  )
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    // Set question time limit
    const currentQ = questions[currentQuestion]
    if (currentQ?.timeLimit) {
      setQuestionTimeLeft(currentQ.timeLimit)
    }
  }, [currentQuestion, questions])
    const currentQ = validQuestions[currentQuestion]
    if (currentQ?.timeLimit) {
      setQuestionTimeLeft(currentQ.timeLimit)
    }
  }, [currentQuestion, validQuestions])

  // Overall timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Question timer
  useEffect(() => {
    if (questionTimeLeft <= 0) return

    const timer = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Auto-move to next question
          if (currentQuestion < questions.length - 1) {
          if (currentQuestion < validQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            toast.warning('Time up! Moving to next question')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [questionTimeLeft, currentQuestion, questions.length])
  }, [questionTimeLeft, currentQuestion, validQuestions.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getTimeColor = (time: number, total: number) => {
    const percentage = time / total
    if (percentage <= 0.2) return 'text-red-600 bg-red-50'
    if (percentage <= 0.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'verbal': return BookOpen
      case 'numerical': return Calculator
      case 'logical': return Brain
      case 'spatial': return Zap
      case 'abstract': return AlertTriangle
      default: return Brain
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'verbal': return 'bg-blue-100 text-blue-800'
      case 'numerical': return 'bg-green-100 text-green-800'
      case 'logical': return 'bg-purple-100 text-purple-800'
      case 'spatial': return 'bg-orange-100 text-orange-800'
      case 'abstract': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
    if (currentQuestion < validQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    const calculatedResults = calculateResults()
    setResults(calculatedResults)
    setShowResults(true)
    onComplete(calculatedResults)
  }

  const calculateResults = () => {
    let correctAnswers = 0
    const questionResults = questions.map((question, index) => {
    const questionResults = validQuestions.map((question, index) => {
      const selectedAnswer = selectedAnswers[index]
      const isCorrect = selectedAnswer === question.correctAnswer
      if (isCorrect) correctAnswers++

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        difficulty: question.difficulty,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: question.options,
        explanation: question.explanation
      }
    })

    const totalQuestions = questions.length
    const totalQuestions = validQuestions.length
    const answeredQuestions = Object.keys(selectedAnswers).length
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

    // Calculate type-wise performance
    const typePerformance = questions.reduce((acc, question, index) => {
      const type = question.type
      if (!acc[type]) {
        acc[type] = { total: 0, correct: 0 }
      }
      acc[type].total++
      
      const selectedAnswer = selectedAnswers[index]
      if (selectedAnswer === question.correctAnswer) {
        acc[type].correct++
      }
      
      return acc
    }, {} as any)

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy),
      completionRate: Math.round(completionRate),
      timeSpent: (timeLimit * 60) - timeLeft,
      typePerformance,
      questionResults
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQ = questions[currentQuestion]
  // Early return if no valid questions
  if (validQuestions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <div className="text-lg text-gray-600">No valid aptitude questions available.</div>
        <Button onClick={() => onComplete({ score: 0, answers: [], timeSpent: 0 })} className="mt-4">
          Continue
        </Button>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / validQuestions.length) * 100
  const currentQ = validQuestions[currentQuestion]

  if (showResults && results) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Brain className="w-8 h-8 text-blue-600" />
              Aptitude Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.accuracy}%</div>
                <div className="text-sm text-blue-700">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.answeredQuestions}</div>
                <div className="text-sm text-purple-700">Answered</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{Math.round(results.timeSpent / 60)}</div>
                <div className="text-sm text-orange-700">Minutes</div>
              </div>
            </div>

            {/* Type-wise Performance */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(results.typePerformance).map(([type, performance]: [string, any]) => {
                  const Icon = getTypeIcon(type)
                  const accuracy = performance.total > 0 ? Math.round((performance.correct / performance.total) * 100) : 0
                  
                  return (
                    <div key={type} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium capitalize">{type}</span>
                        <Badge className={getTypeColor(type)}>
                          {accuracy}%
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {performance.correct}/{performance.total} correct
                      </div>
                      <Progress value={accuracy} className="mt-2" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detailed Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Question Review</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.questionResults.map((result: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    result.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : result.selectedAnswer !== undefined 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Q{index + 1}</span>
                        <Badge className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                        <Badge className={getDifficultyColor(result.difficulty)}>
                          {result.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {result.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : result.selectedAnswer !== undefined ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{result.question}</p>
                    
                    <div className="text-xs text-gray-600">
                      <div>Your answer: {result.selectedAnswer !== undefined ? result.options[result.selectedAnswer] : 'Not answered'}</div>
                      <div>Correct answer: {result.options[result.correctAnswer]}</div>
                      {result.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700">
                          <strong>Explanation:</strong> {result.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQ) return <div>Loading...</div>
  if (!currentQ || !currentQ.type || !currentQ.difficulty) {
    return <div>Loading...</div>
  }

  const TypeIcon = getTypeIcon(currentQ.type)

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Aptitude Test</h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getTimeColor(timeLeft, timeLimit * 60)}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Question {currentQuestion + 1} of {validQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TypeIcon className="w-5 h-5" />
              <Badge className={getTypeColor(currentQ.type)}>
                {currentQ.type.toUpperCase()}
              </Badge>
              <Badge className={getDifficultyColor(currentQ.difficulty)}>
                {currentQ.difficulty.toUpperCase()}
                {currentQ.type?.toUpperCase() || 'UNKNOWN'}
              </Badge>
              <Badge className={getDifficultyColor(currentQ.difficulty)}>
                {currentQ.difficulty?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            {questionTimeLeft > 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                questionTimeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <Clock className="w-3 h-3" />
                {questionTimeLeft}s
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-medium text-gray-800">
            {currentQ.question}
          </div>

          {/* Image if present */}
          {currentQ.image && (
            <div className="flex justify-center">
              <img 
                src={currentQ.image} 
                alt="Question illustration" 
                className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {Object.keys(selectedAnswers).length}/{questions.length} answered
            {Object.keys(selectedAnswers).length}/{validQuestions.length} answered
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentQuestion < questions.length - 1 ? (
          {currentQuestion < validQuestions.length - 1 ? (
            <Button onClick={nextQuestion}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Test
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
          {validQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                index === currentQuestion
                  ? 'bg-blue-500 text-white'
                  : selectedAnswers[index] !== undefined
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AptitudeQuiz