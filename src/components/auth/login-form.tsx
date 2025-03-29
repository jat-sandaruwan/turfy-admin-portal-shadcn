"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuthStore } from "@/lib/store/auth-store"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

/**
 * Login form component
 * Handles user authentication and password reset
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const searchParams = useSearchParams();
  const { status } = useSession();
  const { login, forgotPassword, isLoading, error, clearError } = useAuthStore();

  // Get the callback URL from the query parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Check for error parameter
  const errorParam = searchParams.get("error");

  // Display error message from URL parameter
  useEffect(() => {
    if (errorParam === "AccessDenied") {
      toast.error("Access Denied", {
        description: "You do not have permission to access the admin dashboard",
      });
    }
  }, [errorParam]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === "authenticated" && !isRedirecting) {
      console.log("User already authenticated, redirecting to dashboard");
      setIsRedirecting(true);
      window.location.href = callbackUrl;
    }
  }, [status, callbackUrl, isRedirecting]);

  /**
   * Handle the login form submission
   * Authenticates the user with Firebase and redirects to dashboard on success
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Attempting login for:", email);
      const result = await login(email, password, rememberMe);

      if (result?.success) {
        // Use Sonner for success message
        toast.success("Login successful", {
          description: "Redirecting to dashboard...",
        });

        // Force hard navigation to dashboard to avoid client-side routing issues
        setIsRedirecting(true);
        console.log("Login successful, redirecting to:", callbackUrl);

        // Small delay to show the toast before redirecting
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 1000);
      }
    } catch (error) {
      toast.error("Authentication failed", {
        description: error instanceof Error ? error.message : "Please check your credentials",
      });
    }
  };

  /**
   * Handle the forgot password form submission
   * Sends a password reset email via Firebase
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await forgotPassword(resetEmail);

      if (result?.success) {
        setResetSent(true);
        toast.success("Password reset email sent", {
          description: "Please check your inbox for further instructions",
        });
      }
    } catch (error) {
      toast.error("Failed to send reset email", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    }
  };

  // Loading state when checking auth status or redirecting
  if (status === "loading" || isRedirecting) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium">
          {isRedirecting ? "Redirecting to dashboard..." : "Checking authentication status..."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            {showForgotPassword
              ? "Enter your email to reset your password"
              : "Sign in to access the admin dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!showForgotPassword ? (
            <form onSubmit={handleLogin}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      clearError();
                      setEmail(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      type="button"
                      className="px-0 font-normal text-xs text-muted-foreground"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      clearError();
                      setPassword(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isRedirecting}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="grid gap-6">
                {resetSent ? (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <AlertDescription>
                      If an account exists with this email, you will receive password reset instructions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => {
                        clearError();
                        setResetEmail(e.target.value);
                      }}
                      required
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/2"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                      clearError();
                    }}
                  >
                    Back to login
                  </Button>
                  {!resetSent && (
                    <Button
                      type="submit"
                      className="w-1/2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Reset password"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
