'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { handleSignUp } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3, "Please Enter Valid Name!"),
  email: z.string().min(6, "Please Enter a valid email.").refine(
    (val) => val.includes('@') && val.includes('.'),
    {
      message: 'Enter valid email!'
    }
  ),
  password: z.string().min(8, "Password should be minimum 8 characters!"),
  confirmpassword: z.string().min(8, "Confirm Password should be minimum 8 characters!")
}).refine((data) => data.password === data.confirmpassword, {
  path: ["confirmpassword"],
  message: "Passwords do not match",
})

const CreateSignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmpassword: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      
      const response = await handleSignUp(formData);
      if (response.status === 'success') {
        toast.success("Account created successfully! You can now sign in.");
        router.push('/login');
      } else if (response.status === 'failed') {
        toast.error("Could not create account. Please try again!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className='flex flex-col gap-6' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel>
                  Full Name<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder='Enter your full name' 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel>
                  Email<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder='Enter your email' 
                    {...field}
                    type="email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel>
                  Password<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder='Create a password (min 8 characters)' 
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        
        <FormField
          control={form.control}
          name='confirmpassword'
          render={({ field }) => {
            return (
              <FormItem className='grid gap-2'>
                <FormLabel>
                  Confirm Password<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder='Confirm your password' 
                      {...field} 
                      type={showConfirmPassword ? "text" : "password"}
                      disabled={isLoading}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <Button 
          type="submit" 
          className="w-full mt-2" 
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  )
}

export default CreateSignUp;
