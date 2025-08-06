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

const page = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
        <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          
            <Link href='/signup'>
            <Button variant="link">Sign Up</Button>
            </Link>
           
        </CardAction>
      </CardHeader>
      <CardContent>
        <form action="">
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                name="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required name="password"/>
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
