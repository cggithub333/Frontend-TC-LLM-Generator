"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLogin, useLoginGoogle } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useLogin();
  const loginGoogle = useLoginGoogle();

  const isLoading = login.isPending || loginGoogle.isPending;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    login.mutate(
      { email, password },
      {
        onSuccess: () => router.push("/workspaces"),
        onError: (err) => setError(err.message),
      }
    );
  };

  const handleGoogleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google login failed — no credential received.");
      return;
    }

    setError("");
    loginGoogle.mutate(response.credential, {
      onSuccess: () => router.push("/workspaces"),
      onError: (err) => setError(err.message),
    });
  };

  return (
    <>
      {/* Mobile logo */}
      <header className="flex items-center gap-3 mb-10 lg:hidden">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">QA Artifacts</span>
      </header>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/10">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
            className="h-11"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="#"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="h-11 pr-11"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label
            htmlFor="remember"
            className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
          >
            Remember me for 30 days
          </Label>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {login.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground font-medium">
            or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth */}
      <div className="flex justify-center [&>div]:w-full">
        {loginGoogle.isPending ? (
          <Button variant="outline" className="w-full h-11 gap-3" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting to Google...
          </Button>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed. Please try again.")}
            size="large"
            width={420}
            theme="outline"
            text="signin_with"
          />
        )}
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary font-semibold hover:underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
