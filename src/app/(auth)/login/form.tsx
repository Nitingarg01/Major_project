'use client'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { handleLogin } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email: z.string().min(6, "Please Enter a valid email.").refine(
    (val) => val.includes('@') && val.includes('.'),
    {
      message: 'Enter valid email!'
    }
  ),
  password: z.string().min(8, "Password should be minimum 8 characters!")
})

const CreateLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  const router = useRouter()

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)
      
      const response = await handleLogin(formData)
      
      // Only execute success logic if we get a successful response
      if (response?.success) {
        toast.success("Logged In Successfully!")
        router.push('/')
      }
    } catch (error) {
      // Display the actual error message from the server
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
                <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                <Input 
                  placeholder='Enter your email' 
                  {...field}
                  type="email"
                  disabled={isLoading}
                />
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          name='password'
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <div className="flex items-center justify-between">
                  <FormLabel>Password<span className="text-red-500">*</span></FormLabel>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    placeholder='Enter your password' 
                    {...field} 
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
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

        <Button 
          type='submit' 
          className='w-full mt-2' 
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  )
}

export default CreateLoginForm