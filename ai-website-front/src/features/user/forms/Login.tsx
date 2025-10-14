"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getGoogleLoginUrl } from "../services/UserService"

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced typing animation states
  const [displayText, setDisplayText] = useState("")
  const [animationPhase, setAnimationPhase] = useState("typing")
  const [showUnderline, setShowUnderline] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [trynicText, setTrynicText] = useState("")

  const fullText = "Try it. Make it dynamic"
  const trynicFullText = "Trynic AI"

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (animationPhase === "typing") {
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1))
        }, 80)
      } else {
        timeout = setTimeout(() => {
          setAnimationPhase("fading")
          setFadeOut(true)
        }, 1500)
      }
    } else if (animationPhase === "fading") {
      timeout = setTimeout(() => {
        setDisplayText("")
        setFadeOut(false)
        setAnimationPhase("showing")
      }, 1000)
    } else if (animationPhase === "showing") {
      if (trynicText.length < trynicFullText.length) {
        timeout = setTimeout(() => {
          setTrynicText(trynicFullText.slice(0, trynicText.length + 1))
        }, 120)
      } else {
        timeout = setTimeout(() => {
          setAnimationPhase("underlining")
          setShowUnderline(true)
        }, 800)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, animationPhase, trynicText])

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Google OAuth redirect using UserService
    setTimeout(() => {
      window.location.href = getGoogleLoginUrl()
    }, 500)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Left side: Enhanced typing animation */}
      <div className="w-1/2 flex items-center justify-center relative z-10">
        <div className="text-center space-y-8">
          {/* Main animated text */}
          <div className="relative">
            {(animationPhase === "typing" || animationPhase === "fading") && (
              <h1
                className={`text-5xl lg:text-6xl xl:text-7xl font-bold text-white font-mono transition-all duration-1000 ${fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
              >
                {displayText}
                {animationPhase === "typing" && <span className="animate-pulse text-sky-400">|</span>}
              </h1>
            )}

            {(animationPhase === "showing" || animationPhase === "underlining") && (
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white font-mono animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
                  {trynicText}
                </span>
                {animationPhase === "showing" && <span className="animate-pulse text-sky-400">|</span>}
              </h1>
            )}

            {showUnderline && (
              <div className="relative mt-1 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 rounded-full animate-[slideWidth_1000ms_ease-out_forwards] w-0"></div>
                <div className="absolute inset-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 rounded-full blur-sm opacity-50 animate-[slideWidth_1000ms_ease-out_forwards] w-0"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Enhanced login form */}
      <div className="w-1/2 flex items-center justify-center p-8 relative z-10">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right duration-1000">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue to Trynic AI</p>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium py-3 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
