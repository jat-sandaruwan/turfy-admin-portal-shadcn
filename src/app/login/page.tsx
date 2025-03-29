"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { LoginForm } from "@/components/auth/login-form"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Only render UI after component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Create inline styles for logo inversion
  const logoStyle = {
    filter: mounted && resolvedTheme === 'light' ? 'invert(100%)' : 'none'
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-md overflow-hidden">
            <Image 
              src="/turfy_ball_minimal.png" 
              alt="Turfy Logo" 
              width={32} 
              height={32}
              className="object-contain"
              style={logoStyle}
            />
          </div>
          <span>Turfy Admin</span>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}