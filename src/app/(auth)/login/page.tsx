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
import CreateLoginForm from "./form"
import { Brain, Sparkles } from "lucide-react"

const page = async () => {
  const session = await auth()
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold text-2xl">
              AI Interview
            </span>
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm">
            Practice interviews with AI • Get instant feedback • Land your dream job
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to continue your interview practice journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <form action={async () => {
              "use server"
              await signIn("google")
            }}>
              <Button variant="outline" className="w-full h-12 border-2" type="submit">
                <div className="flex items-center justify-center gap-3">
                  <Image src={logo} width={20} height={20} alt="Google logo" />
                  <span className="font-medium">Continue with Google</span>
                </div>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500 font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <CreateLoginForm />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                Sign up for free
              </Link>
            </div>
            
            {/* Features highlight */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 mb-2 font-medium">🎉 100% Free Features</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>✅ Unlimited interviews</div>
                <div>✅ AI feedback</div>
                <div>✅ Multiple rounds</div>
                <div>✅ Company specific</div>
              </div>
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