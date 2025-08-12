'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import z, { email } from 'zod'

const schema = z.object({
  name:z.string().min(3,"Please Enter Valid Name!"),
  email:z.string().min(6,"Please Enter a valid email.").refine(
    (val)=>val.includes('@') && val.includes('.com'),
    {
      message:'Enter valid email!'
    }
  )
})

const form = () => {

  const form = useForm({

  })

  return (
    <div>
      
    </div>
  )
}

export default form
