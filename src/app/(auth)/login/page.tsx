"use client";

import { useState } from "react";
import Link from "next/link";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { AlertBanner } from "@/components/ui/alert-banner";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthDivider } from "@/components/ui/auth-divider";
import { Loader2 } from "lucide-react";
import { useLogin, useLoginGoogle } from "@/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const login = useLogin();
  const loginGoogle = useLoginGoogle();

  const isLoading = login.isPending || loginGoogle.isPending;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setRedirecting(true);
          const dest = data?.role === "ADMIN" ? "/admin/overview" : "/workspaces";
          setTimeout(() => { window.location.href = dest; }, 300);
        },
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
      onSuccess: (data) => {
        setRedirecting(true);
        const dest = data?.role === "ADMIN" ? "/admin/overview" : "/workspaces";
        setTimeout(() => { window.location.href = dest; }, 300);
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <div className="animate-stagger">
      {/* Mobile logo */}
      <header className="flex items-center gap-3 mb-10 lg:hidden">
        <Logo href={undefined} />
      </header>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
          Sign in to your account.
        </p>
      </div>

      {/* Error banner */}
      {error && <AlertBanner message={error} className="mb-6" />}

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
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            disabled={isLoading}
            className="h-11"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.closest("form")?.requestSubmit();
              }
            }}
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading || redirecting}>
          {redirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : login.isPending ? (
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
      <AuthDivider />

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
    </div>
  );
}
