"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegister } from "@/hooks/use-auth";

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const register = useRegister();

  const isLoading = register.isPending;
  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const allRulesPassed = passwordStrength === PASSWORD_RULES.length;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRulesPassed) {
      setError("Please meet all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    register.mutate(
      { email, password, fullName },
      {
        onSuccess: () => router.push("/workspaces"),
        onError: (err) => {
          if (err.message.includes("unexpected")) {
            setError("This email may already be registered. Try signing in instead.");
          } else {
            setError(err.message);
          }
        },
      }
    );
  };

  const clearError = () => {
    if (error) setError("");
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
          Create an account
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
          Get started with AI-powered test case generation.
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
      <form className="space-y-5" onSubmit={handleSignUp}>
        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            disabled={isLoading}
            className="h-11"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearError();
            }}
          />
        </div>

        {/* Email */}
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
              clearError();
            }}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              className="h-11 pr-11"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
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

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex gap-1.5">
                {PASSWORD_RULES.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < passwordStrength
                        ? passwordStrength === PASSWORD_RULES.length
                          ? "bg-emerald-500"
                          : passwordStrength >= 2
                            ? "bg-amber-500"
                            : "bg-destructive"
                        : "bg-border"
                    )}
                  />
                ))}
              </div>
              <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.key}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        passed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3 shrink-0",
                          passed ? "opacity-100" : "opacity-30"
                        )}
                      />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              className={cn(
                "h-11 pr-11",
                confirmPassword.length > 0 &&
                  password !== confirmPassword &&
                  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
              )}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError();
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-xs text-destructive">
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(v) => {
              setAgreedToTerms(v === true);
              clearError();
            }}
            className="mt-0.5"
          />
          <Label
            htmlFor="terms"
            className="text-sm font-normal text-muted-foreground cursor-pointer select-none leading-snug"
          >
            I agree to the{" "}
            <Link
              href="#"
              className="text-primary hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-primary hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {register.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
