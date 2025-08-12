
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
import { FormEvent, useState } from "react"
import { handleSignUp } from "./actions"
import { signIn } from "@/app/auth"
import Image from "next/image"
import logo from 'public/image.png'
import CreateSignUp from "./form"


const page = () => {


  return (
  
    <>
    <CreateSignUp/>
    </>
  )
}

export default page
