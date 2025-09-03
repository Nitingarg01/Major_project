import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { auth, signIn } from "@/app/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import logo from 'public/image.png'
import CreateSignUp from "./form"
import { Brain, Sparkles, Users, Target, Zap } from "lucide-react"

const page = async () => {
  const session = await auth()
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-green-600" />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text font-bold text-2xl">
              AI Interview
            </span>
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm">
            Join thousands of developers practicing interviews with AI
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Create your account</CardTitle>
            <CardDescription className="text-gray-600">
              Start your journey to ace technical interviews
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google Sign Up */}
            <form action={async () => {
              "use server"
              await signIn("google")
            }}>
              <Button variant="outline" className="w-full h-12 border-2" type="submit">
                <div className="flex items-center justify-center gap-3">
                  <Image src={logo} width={20} height={20} alt="Google logo" />
                  <span className="font-medium">Sign up with Google</span>
                </div>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500 font-medium">Or create with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <CreateSignUp />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Sign in here
              </Link>
            </div>
            
            {/* Features highlight */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3 text-center">🚀 What you'll get for free:</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span>Unlimited mock interviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Company-specific questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Real-time AI feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span>Technical + Behavioral + DSA rounds</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2024 AI Interview App. Made with ❤️ for developers.</p>
        </div>
      </div>
    </div>
  )
}

export default page