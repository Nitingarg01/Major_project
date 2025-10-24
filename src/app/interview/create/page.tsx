'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Briefcase, Building2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CreateInterviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    interviewType: 'behavioral',
    experienceLevel: 'mid',
    additionalNotes: ''
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        toast.success('Resume uploaded successfully');
      } else {
        toast.error('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobTitle', formData.jobTitle);
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('interviewType', formData.interviewType);
      formDataToSend.append('experienceLevel', formData.experienceLevel);
      formDataToSend.append('additionalNotes', formData.additionalNotes);
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }

      const response = await fetch('/api/interviews/create', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Interview created successfully!');
        router.push(`/interview/${data.interviewId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create interview');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Interview</h1>
          <p className="text-gray-600">Set up your mock interview with AI virtual coach</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <Label htmlFor="jobTitle" className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" />
                Job Title *
              </Label>
              <Input
                id="jobTitle"
                required
                placeholder="e.g. Software Engineer, Product Manager"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                data-testid="job-title-input"
              />
            </div>

            {/* Company Name */}
            <div>
              <Label htmlFor="companyName" className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" />
                Company Name *
              </Label>
              <Input
                id="companyName"
                required
                placeholder="e.g. Google, Microsoft, Amazon"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                data-testid="company-name-input"
              />
            </div>

            {/* Interview Type */}
            <div>
              <Label htmlFor="interviewType" className="mb-2 block">Interview Type *</Label>
              <select
                id="interviewType"
                required
                value={formData.interviewType}
                onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="interview-type-select"
              >
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="mixed">Mixed (Behavioral + Technical)</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <Label htmlFor="experienceLevel" className="flex items-center gap-2 mb-2">
                <UserCircle className="w-4 h-4" />
                Experience Level *
              </Label>
              <select
                id="experienceLevel"
                required
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="experience-level-select"
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (5+ years)</option>
              </select>
            </div>

            {/* Resume Upload */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4" />
                Upload Resume (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="resume-upload-input"
                />
                <label htmlFor="resume" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {resumeFile ? (
                      <span className="text-blue-600 font-medium">{resumeFile.name}</span>
                    ) : (
                      <>Click to upload or drag and drop<br />PDF or DOCX (Max 5MB)</>
                    )}
                  </p>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload your resume for personalized questions based on your experience
              </p>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="additionalNotes" className="mb-2 block">
                Additional Notes (Optional)
              </Label>
              <textarea
                id="additionalNotes"
                rows={4}
                placeholder="Any specific areas you'd like to focus on or additional context..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="additional-notes-textarea"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="start-interview-btn"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Start Interview'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
