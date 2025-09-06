import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Brain, Sparkles, ArrowLeft } from "lucide-react"
import ResetPasswordForm from "./form"
import { redirect } from "next/navigation"

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const { token } = await searchParams

  if (!token) {
    redirect('/login')
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
            Create a new password for your account
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Set New Password</CardTitle>
            <CardDescription className="text-gray-600">
              Enter a strong password to secure your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2024 AI Interview App. Made with ❤️ for developers.</p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage