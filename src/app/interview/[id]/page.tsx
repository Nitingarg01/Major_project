import React from 'react';
import { getInterviewDetails, getQuestions } from './perform/actions';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, Target, Users, Brain, ArrowRight, Play, FileText } from 'lucide-react';
import CompanyIntelligenceService from '@/lib/companyIntelligence';
import CompanyIntelligenceService from '@/lib/companyIntelligence';
import InterviewPageClient from '@/components/InterviewPageClient';

const page = async ({params}:{
    params: Promise<{id:string}>
}) => {
    const session = await auth();
    if(!session?.user){
        redirect('/login');
    }

    const id = (await params).id;
    const interview = await getInterviewDetails(id);
    const det = await getQuestions(id);

    if (!interview) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-2xl font-bold text-red-600">Interview Not Found</div>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        )
    }

    // Get company intelligence
    const companyIntelligence = await CompanyIntelligenceService.getInstance().getCompanyIntelligence(interview.companyName);

    function capitalizeFirstWord(str: string) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const getInterviewTypeIcon = (type: string) => {
        switch (type) {
            case 'technical': return Brain
            case 'behavioral': return Users  
            case 'mixed': return Target
            default: return Target
        }
    }

    const InterviewTypeIcon = getInterviewTypeIcon(interview.interviewType || 'mixed');

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-2">
                    Mock Interview Ready
                </h1>
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                    <Building2 className="w-5 h-5" />
                    <span>{capitalizeFirstWord(interview.companyName)} - {interview.jobTitle}</span>
                </div>
            </div>

            {/* Interview Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Interview Info */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Details</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    <span className="text-gray-700">Company: <strong>{capitalizeFirstWord(interview.companyName)}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700">Role: <strong>{interview.jobTitle}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <InterviewTypeIcon className="w-5 h-5 text-purple-600" />
                                    <span className="text-gray-700">Type: <strong>{capitalizeFirstWord(interview.interviewType || 'mixed')}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <span className="text-gray-700">Duration: <strong>30-45 minutes</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {interview.skills?.map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Company Intelligence */}
                    {companyIntelligence && (
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                {companyIntelligence.companyData.name} Insights
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Badge variant="outline" className={`
                                        ${companyIntelligence.companyData.difficulty === 'hard' ? 'border-red-300 text-red-700' :;
                                        companyIntelligence.companyData.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :;
                                        'border-green-300 text-green-700'}
                                    `}>
                                        {companyIntelligence.companyData.difficulty.toUpperCase()} Difficulty
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Focus Areas:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {companyIntelligence.companyData.focusAreas.slice(0, 4).map((area: string, index: number) => (
                                            <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                                                {area}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Tech Stack:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {companyIntelligence.companyData.techStack.slice(0, 6).map((tech: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                                {tech}
                                            </Badge>
                                        ))}
                                        {companyIntelligence.companyData.techStack.length > 6 && (
                                            <span className="text-xs text-blue-600">+{companyIntelligence.companyData.techStack.length - 6} more</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <p className="text-xs text-yellow-800">
                                        <strong>💡 Quick Tip:</strong> {companyIntelligence.companyData.preparationTips[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Interview Status */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Interview Status</h3>
                        {det !== null ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 font-medium">Ready to Start</span>
                                <Badge variant="secondary" className="ml-2">
                                    {det?.questions?.length || 0} Questions Generated
                                </Badge>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-yellow-700 font-medium">Generating Questions...</span>
                            </div>
                        )}
                    </div>
                    
                    {det !== null ? (
                        <Link href={`/interview/${id}/perform`}>
                            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                                <Play className="w-5 h-5 mr-2" />
                                Start Interview
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    ) : (
                        <Button size="lg" disabled className="bg-gray-300">
                            <Clock className="w-5 h-5 mr-2" />
                            Preparing...
                        </Button>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Before You Start</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">📋 Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Ensure your camera and microphone are working</li>
                            <li>• Find a quiet, well-lit environment</li>
                            <li>• Have a stable internet connection</li>
                            <li>• Close other applications to avoid distractions</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">🎯 Tips:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Speak clearly and maintain eye contact with camera</li>
                            <li>• Take your time to think before answering</li>
                            <li>• Provide specific examples when possible</li>
                            <li>• Stay calm and be yourself</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Link href="/">
                    <Button variant="outline">
                        ← Back to Dashboard
                    </Button>
                </Link>
                
                {det !== null && interview.status === 'completed' && (
                    <Link href={`/interview/${id}/feedback`}>
                        <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            View Feedback
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default page;
    return (
        <InterviewPageClient 
            interview={interview}
            det={det}
            companyIntelligence={companyIntelligence}
        />
    )
}

export default page;
