'use client'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { handleForgotPassword } from './actions'
import { toast } from 'sonner'
import { Mail, CheckCircle } from 'lucide-react'

const schema = z.object({
  email: z.string().min(6, "Please Enter a valid email.").refine(
    (val) => val.includes('@') && val.includes('.'),
    {
      message: 'Enter valid email!'
    }
  )
})

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      
      const response = await handleForgotPassword(formData)
      
      if (response?.success) {
        setEmailSent(true)
        toast.success("Password reset email sent! Check your inbox.")
      } else {
        toast.error(response?.error || "Failed to send reset email")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h3>
          <p className="text-gray-600 text-sm">
            We've sent a password reset link to <strong>{form.getValues('email')}</strong>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setEmailSent(false)}
          className="w-full"
        >
          Try Different Email
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form className='flex flex-col gap-6' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name='email'
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address<span className="text-red-500">*</span>
                </FormLabel>
                <Input 
                  placeholder='Enter your registered email' 
                  {...field}
                  type="email"
                  disabled={isLoading}
                  className="h-12"
                />
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <Button 
          type='submit' 
          className='w-full mt-2 h-12' 
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </Button>
      </form>
    </Form>
  )
}

export default ForgotPasswordForm