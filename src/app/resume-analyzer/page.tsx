'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft, Loader2, FileText, Sparkles, CheckCircle, Target } from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    targetRole: '',
    targetCompany: '',
    experienceLevel: 'mid',
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
    
    if (!formData.targetRole) {
      setError('Please enter a target job role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('resume', resumeFile);
      formDataToSend.append('targetRole', formData.targetRole);
      formDataToSend.append('targetCompany', formData.targetCompany);
      formDataToSend.append('experienceLevel', formData.experienceLevel);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      router.push(`/resume-analyzer/result/${data.analysisId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Resume Analyzer
              </span>
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center text-gray-700 hover:text-green-600 text-sm font-medium transition-colors"
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
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered ATS Analysis
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Analyze Your Resume</h1>
          <p className="text-lg text-gray-600">
            Get instant ATS score, role-specific feedback, and actionable improvement tips
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm mb-1">ATS Score</h3>
            <p className="text-xs text-gray-600">Beat applicant tracking systems</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Role-Specific</h3>
            <p className="text-xs text-gray-600">Tailored to your target job</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm mb-1">AI Insights</h3>
            <p className="text-xs text-gray-600">Powered by advanced AI</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Upload Your Resume (PDF) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
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
                      <p className="text-sm font-medium text-green-600 mb-1">{resumeFile.name}</p>
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

            {/* Target Role */}
            <div>
              <label htmlFor="targetRole" className="block text-sm font-semibold text-gray-900 mb-2">
                Target Job Role *
              </label>
              <input
                type="text"
                id="targetRole"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g., Senior Software Engineer, Product Manager"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            {/* Target Company */}
            <div>
              <label htmlFor="targetCompany" className="block text-sm font-semibold text-gray-900 mb-2">
                Target Company (Optional)
              </label>
              <input
                type="text"
                id="targetCompany"
                value={formData.targetCompany}
                onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                placeholder="e.g., Google, Microsoft, Startup"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Experience Level
              </label>
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6+ years)</option>
                <option value="lead">Lead/Principal (10+ years)</option>
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
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              data-testid="analyze-resume-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your resume will be analyzed for ATS compatibility, keywords, formatting, and role-specific requirements</p>
        </div>
      </div>
    </div>
  );
}
