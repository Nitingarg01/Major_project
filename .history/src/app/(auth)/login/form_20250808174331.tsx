'use client'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import z, { email } from 'zod'
import { handleLogin } from './actions'

const schema = z.object({

  email: z.string().min(6, "Please Enter a valid email.").refine(
    (val) => val.includes('@') && val.includes('.com'),
    {
      message: 'Enter valid email!'
    }
  ),
  password: z.string().min(8, "Password should be minimum 8 characters!")
})

const CreateLoginForm = () => {

    const form  = useForm({
        resolver:zodResolver(schema),
        defaultValues:{
            email:'',
            password:''
        }
    })

    const onSubmit = async (data: z.infer<typeof schema>)=>{
       console.log(data)
       const formData = new FormData()
       formData.append("email",data.email)
       formData.append("password",data.password)
       const response = await handleLogin(formData)
    }

  return (
    <Form {...form}>
      <form className='flex flex-col gap-6' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
        name='email'
        control={form.control}
        render={({field})=>{
            return (
                <FormItem className='grid gap-2'>
                    <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                    <Input placeholder='Enter Email' {...field}/>
                </FormItem>
            )
        }}
        
        />
        
        <FormField
        name='password'
        control={form.control}
        render={({field})=>{
            return (
                <FormItem className='grid gap-2'>
                    <FormLabel>Password<span className="text-red-500">*</span></FormLabel>
                    <Input placeholder='Enter Password' {...field} type='password'/>
                </FormItem>
            )
        }}
        />

        <Button type='submit' className='w-full mt-2'>
            Login
        </Button>
      </form>
    </Form>
  )
}

export default CreateLoginForm
