"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

const page = () => {

    const [formValues,setFormValues] = useState({
        name:"",
        email:"",
        password:"",
        confirmpassword:""
    })

  return (
    <div className="flex justify-center items-center w-full h-screen">
        <Card className="w-full max-w-sm">
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
      <CardContent>
        <form action="">
          <div className="flex flex-col gap-6">
             <div className="grid gap-2">
              <Label htmlFor="email">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                required
                name="name"
                value={formValues.name}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                name="email"
                value={formValues.email}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
               
              </div>
              <Input id="password" type="password" required name="password" value={formValues.password}/>
            </div>
             <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="Confirm password">Confirm Password</Label>
               
              </div>
              <Input id="cnf-pass" type="password" required name="confirmpassword" value={formValues.confirmpassword}/>
            </div>
          </div>
            <Button type="submit" className="w-full mt-2">
          Sign Up
        </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
      
        <Button variant="outline" className="w-full">
         Sign Up With Google
        </Button>
      </CardFooter>
    </Card>
    </div>
  )
}

export default page
