'use client'
import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface DeleteInterviewButtonProps {
  interviewId: string
}

const DeleteInterviewButton = ({ interviewId }: DeleteInterviewButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete('/api/delete-interview', {
        data: { interviewId }
      })

      if (response.data.success) {
        toast.success('🗑️ Interview deleted successfully!')
        setIsOpen(false);
        // Refresh the page to show updated list
        router.refresh()
      } else {
        toast.error('Failed to delete interview')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to delete interview';
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div>
                <Trash2 className='cursor-pointer w-5 h-5 text-red-500 hover:text-red-700 transition-colors' />
              </div>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Interview
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to delete this interview? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>The interview session and all its data</li>
                <li>All generated questions and answers</li>
                <li>Performance feedback and analysis</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Interview
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</TooltipTrigger>
<TooltipContent>
  <span className="text-red-600">Delete Interview</span>
</TooltipContent>
</Tooltip>
  )
}

export default DeleteInterviewButton;