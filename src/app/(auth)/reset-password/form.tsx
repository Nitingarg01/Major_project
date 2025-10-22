'use client'
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { handleResetPassword } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

const schema = z.object({
  password: z.string().min(8, "Password should be minimum 8 characters!"),
  confirmPassword: z.string().min(8, "Password should be minimum 8 characters!")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface ResetPasswordFormProps {
  token: string
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const response = await handleResetPassword(token, data.password);
      
      if (response?.success) {
        setResetSuccess(true);
        toast.success("Password reset successfully!")
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(response?.error || "Failed to reset password")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
      toast.error(errorMessage)
    } finally {
      setIsLoading(false);
    }
  }

  if (resetSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Password Reset Successfully!</h3>
          <p className="text-gray-600 text-sm">
            Your password has been updated. Redirecting you to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form className='flex flex-col gap-6' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name='password'
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password<span className="text-red-500">*</span>
                </FormLabel>
                <div className="relative">
                  <Input 
                    placeholder='Enter new password' 
                    {...field} 
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="h-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          name='confirmPassword'
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password<span className="text-red-500">*</span>
                </FormLabel>
                <div className="relative">
                  <Input 
                    placeholder='Confirm new password' 
                    {...field} 
                    type={showConfirmPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="h-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
          <h4 className="font-medium mb-2">Password Requirements:</h4>
          <ul className="space-y-1 text-xs">
            <li>• At least 8 characters long</li>
            <li>• Use a mix of letters, numbers, and symbols</li>
            <li>• Avoid common passwords</li>
          </ul>
        </div>

        <Button 
          type='submit' 
          className='w-full mt-2 h-12' 
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </Form>
  )
}

export default ResetPasswordForm;