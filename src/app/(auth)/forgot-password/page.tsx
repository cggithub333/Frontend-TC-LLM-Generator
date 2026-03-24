"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import {
  Loader2,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      setIsSubmitted(true);
    } catch {
      // Still show success — security: don't reveal if email exists
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile logo */}
      <header className="flex items-center gap-3 mb-10 lg:hidden">
        <Logo href={undefined} />
      </header>

      {isSubmitted ? (
        <div className="space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              We sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Please check your inbox and follow the instructions.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
            >
              Didn&apos;t receive it? Try again
            </Button>

            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full h-11 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Forgot password?
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
              No worries. Enter the email address associated with your account
              and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </>
      )}
    </>
  );
}
