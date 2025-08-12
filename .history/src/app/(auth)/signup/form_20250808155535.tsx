'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import z, { email } from 'zod'
import { handleSignUp } from './actions'

const schema = z.object({
  name:z.string().min(3,"Please Enter Valid Name!"),
  email:z.string().min(6,"Please Enter a valid email.").refine(
    (val)=>val.includes('@') && val.includes('.com'),
    {
      message:'Enter valid email!'
    }
  ),
  password:z.string().min(8,"Password should be minimum 8 characters!"),
  confirmpassword:z.string().min(8,"Confirm Password should be minimum 8 characters!")
})

const form = async () => {

  const form = useForm({
    resolver:zodResolver(schema),
    defaultValues:{
      name:'',
      email:'',
      password:'',
      confirmpassword:''
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>)=>{
    console.log(data)
  }

  return (
    <div className='flex justify-center items-center w-full h-screen'>
      
    </div>
  )
}

export default form
