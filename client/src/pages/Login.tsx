"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileText } from "lucide-react"

interface LoginPageProps {
  onAuthSuccess: (authCode: string) => void
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

      const scope = "https://www.googleapis.com/auth/drive.readonly"

      const redirectUri = import.meta.env.VITE_REDIRECT_URL

      const state = Math.random().toString(36).substring(2)
      localStorage.setItem("oauth_state", state)

      // Construct the authorization URL for the Authorization Code flow
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      authUrl.searchParams.append("client_id", clientId)
      authUrl.searchParams.append("redirect_uri", redirectUri)
      authUrl.searchParams.append("response_type", "code")
      authUrl.searchParams.append("scope", scope)
      authUrl.searchParams.append("state", state)
      authUrl.searchParams.append("prompt", "consent")
      authUrl.searchParams.append("access_type", "offline")

      window.location.href = authUrl.toString()
    } catch (error) {
      console.error("Authentication error:", error)
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Could not authenticate with Google. Please try again.",
      })
      setIsLoading(false)
    }
  }

  // Handle the OAuth callback
  const handleCallback = () => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const state = params.get("state")
    const storedState = localStorage.getItem("oauth_state")

    if (code && state === storedState) {
      localStorage.removeItem("oauth_state")
      onAuthSuccess(code);
    }
  }

  useEffect(() => {
    handleCallback()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">DriveSearch</CardTitle>
          <CardDescription>Search your Google Drive files with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Sign in with your Google account to access your Drive files
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Sign in with Google"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
