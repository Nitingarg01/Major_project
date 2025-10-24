'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft, Loader2, Video, Sparkles } from 'lucide-react';

export default function CreateInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    experienceLevel: 'mid',
    interviewType: 'behavioral',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setResumeFile(file);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }
    
    if (!formData.jobTitle) {
      setError('Please enter a job title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload and parse resume
      const formDataToSend = new FormData();
      formDataToSend.append('resume', resumeFile);
      formDataToSend.append('jobTitle', formData.jobTitle);
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('experienceLevel', formData.experienceLevel);
      formDataToSend.append('interviewType', formData.interviewType);

      const response = await fetch('/api/interviews/create', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create interview');
      }

      // Redirect to interview page
      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Mock Interview
              </span>
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Interview
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create New Interview</h1>
          <p className="text-lg text-gray-600">
            Upload your resume and set your preferences to generate personalized interview questions
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Upload Your Resume (PDF) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  {resumeFile ? (
                    <div>
                      <p className="text-sm font-medium text-indigo-600 mb-1">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Click to upload resume</p>
                      <p className="text-xs text-gray-500">PDF format only</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-900 mb-2">
                Target Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-2">
                Target Company (Optional)
              </label>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-900 mb-2">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6+ years)</option>
              </select>
            </div>

            {/* Interview Type */}
            <div>
              <label htmlFor="interviewType" className="block text-sm font-semibold text-gray-900 mb-2">
                Interview Type
              </label>
              <select
                id="interviewType"
                value={formData.interviewType}
                onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="mixed">Mixed (Behavioral + Technical)</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              data-testid="create-interview-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Interview Questions...
                </>
              ) : (
                'Create Interview'
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your interview will include 5-7 AI-generated questions tailored to your resume and preferences</p>
        </div>
      </div>
    </div>
  );
}
