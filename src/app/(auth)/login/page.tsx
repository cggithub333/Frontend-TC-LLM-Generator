"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // src/app/(auth)/login/page.tsx (around line 14)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // To add specific username/password checking, do it here:
    if (email === "admin@gmail.com" && password === "12345") {
      router.push("/workspaces");
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-0 sm:p-6 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Login Card */}
      <main className="w-full max-w-lg bg-card sm:rounded-2xl shadow-sm sm:shadow-xl border-0 sm:border border-border p-6 md:p-10 min-h-screen sm:min-h-0 flex flex-col justify-center transition-all duration-300">
        {/* Header */}
        <header className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">QA Artifacts</span>
        </header>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold leading-[1.3] mb-3">Welcome Back</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Enter your credentials to access your quality assurance workspace.
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <Label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@gmail.com"
              required
              className="w-full px-4 py-3.5"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="block text-sm font-semibold">
                Password (12345 nha)
              </Label>
              <Link
                href="#"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3.5 pr-12"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full py-4 shadow-lg shadow-primary/20"
          >
            Login
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
            <span className="bg-card px-4 text-muted-foreground">OR</span>
          </div>
        </div>

        {/* OAuth */}
        <div className="space-y-8">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-3.5 border-b-2 active:border-b-0 active:translate-y-[1px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="#" className="text-primary font-bold hover:underline ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="hidden sm:block fixed bottom-6 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
        © 2024 QA Artifacts Inc. • AI-Powered Excellence
      </footer>
    </div>
  );
}
