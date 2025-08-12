'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import z, { email } from 'zod'
import { handleSignUp } from './actions'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from '@/app/auth'
import Image from "next/image"
import logo from 'public/image.png'

const schema = z.object({
  name: z.string().min(3, "Please Enter Valid Name!"),
  email: z.string().min(6, "Please Enter a valid email.").refine(
    (val) => val.includes('@') && val.includes('.com'),
    {
      message: 'Enter valid email!'
    }
  ),
  password: z.string().min(8, "Password should be minimum 8 characters!"),
  confirmpassword: z.string().min(8, "Confirm Password should be minimum 8 characters!")
})

const form = async () => {

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
    console.log(data)
  }

  const passwordCheck = form.getValues("password")===form.getValues("confirmpassword")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex justify-center items-center w-full h-screen'>
        <Card className='w-full max-w-sm'>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Create a new account and login
            </CardDescription>
            <CardAction>

              <Link href='/login'>
                <Button variant="link">Login</Button>
              </Link>

            </CardAction>
          </CardHeader>

          <CardContent className='flex flex-col gap-6'>
            <FormField
            control={form.control}
            name='name'
            render={({field})=>{
              return (
                <FormItem className='grid gap-2'>
                  <FormLabel>
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Name' {...field}/>
                  </FormControl>

                </FormItem>
              )
            }}
            />
             <FormField
            control={form.control}
            name='email'
            render={({field})=>{
              return (
                <FormItem className='grid gap-2'>
                  <FormLabel>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Email' {...field}/>
                  </FormControl>

                </FormItem>
              )
            }}
            />
             <FormField
            control={form.control}
            name='password'
            render={({field})=>{
              return (
                <FormItem className='grid gap-2'>
                  <FormLabel>
                    Password 
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Password' {...field}/>
                  </FormControl>

                </FormItem>
              )
            }}
            />
             <FormField
            control={form.control}
            name='confirmpassword'
            render={({field})=>{
              return (
                <FormItem className='grid gap-2'>
                  <FormLabel>
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Confirm Password' {...field}/>
                  </FormControl>

                </FormItem>
              )
            }}
            />
<span>
{passwordCheck && 
form.getValues("confirmpassword").length>0 && (<span className="text-red-500 text-sm">Passwords do not match.</span>)}
</span>
          </CardContent>
          <CardFooter className='flex-col gap-2'>
             <form action={async ()=>{
        "use server"
        await signIn("google")
      }}>
         <Button variant="outline" className="w-full" type="submit">
          <div className="flex flex-row gap-1"><Image src={logo} width={20} height={20} alt="logo"/><span> Sign Up With Google</span></div>
        
        </Button>
      </form>
          </CardFooter>
        </Card>

      </form>

    </Form>
  )
}

export default form
