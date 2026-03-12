"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegister } from "@/hooks/use-auth";
import type { SignupResponse } from "@/types/auth.types";

const PASSWORD_RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
] as const;

type PageState = "form" | "check-email" | "verified";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Page state
  const [pageState, setPageState] = useState<PageState>("form");

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Post-submit state
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(0);

  // Verified success state
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const register = useRegister();
  const isLoading = register.isPending;
  const passwordStrength = PASSWORD_RULES.filter((r) =>
    r.test(password),
  ).length;
  const allRulesPassed = passwordStrength === PASSWORD_RULES.length;

  // Handle query params on mount (error redirects & verified)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const verifiedParam = searchParams.get("verified");

    if (verifiedParam === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageState("verified");
      router.replace("/signup", { scroll: false });
    } else if (errorParam === "expired") {
      setError("Your verification link has expired. Please sign up again.");
      router.replace("/signup", { scroll: false });
    } else if (errorParam === "invalid") {
      setError(
        "Invalid verification link. Please check your email and try again.",
      );
      router.replace("/signup", { scroll: false });
    }
  }, [searchParams, router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Expiry timer
  useEffect(() => {
    if (expirySeconds <= 0 || pageState !== "check-email") return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds, pageState]);

  // Redirect countdown for verified state
  useEffect(() => {
    if (pageState !== "verified") return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pageState, router]);

  const handleSignupSuccess = useCallback((data: SignupResponse) => {
    setPageState("check-email");
    setCooldownSeconds(data.cooldownSeconds);
    setExpirySeconds(data.expiresInSeconds);
  }, []);

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

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (dob > minAge) {
        setError("You must be at least 13 years old to sign up.");
        return;
      }
    }

    register.mutate(
      {
        email,
        password,
        fullName,
        confirmPassword,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      },
      {
        onSuccess: handleSignupSuccess,
        onError: (err) => {
          if (err.message.includes("unexpected")) {
            setError(
              "This email may already be registered. Try signing in instead.",
            );
          } else {
            setError(err.message);
          }
        },
      },
    );
  };

  const handleResend = () => {
    setError("");
    register.mutate(
      {
        email,
        password,
        fullName,
        confirmPassword,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      },
      {
        onSuccess: handleSignupSuccess,
        onError: (err) => setError(err.message),
      },
    );
  };

  const clearError = () => {
    if (error) setError("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ─── VERIFIED SUCCESS STATE ───
  if (pageState === "verified") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-10 h-10 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Success Text */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Account Created Successfully!
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your email has been verified and your account is now active. You
              can start using QA Artifacts right away.
            </p>
          </div>

          {/* Redirection & Countdown */}
          <div className="bg-muted/50 border border-border rounded-2xl p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              You will be redirected to the login page in{" "}
              <span className="text-foreground font-bold text-lg">
                {redirectCountdown}
              </span>{" "}
              seconds...
            </p>
            {/* Visual Countdown Progress */}
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(redirectCountdown / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Manual Navigation */}
          <div className="pt-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Didn&apos;t get redirected? Click here to login manually.
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── CHECK EMAIL STATE ───
  if (pageState === "check-email") {
    return (
      <>
        {/* Mobile logo */}
        <header className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">QA Artifacts</span>
        </header>

        <div className="text-center space-y-6">
          {/* Email icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Check your email
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              We&apos;ve sent a verification email to{" "}
              <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          {/* Expiry countdown */}
          {expirySeconds > 0 && (
            <div className="bg-muted/50 border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Verification link expires in{" "}
                <span className="font-mono font-bold text-foreground">
                  {formatTime(expirySeconds)}
                </span>
              </p>
            </div>
          )}

          {expirySeconds === 0 && pageState === "check-email" && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Verification link has expired. Please resend the email.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cooldown / Resend */}
          <div className="space-y-3">
            {cooldownSeconds > 0 ? (
              <div className="flex flex-col items-center gap-3">
                {/* SVG circular countdown */}
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted opacity-20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={
                      2 * Math.PI * 45 * (1 - cooldownSeconds / 60)
                    }
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-linear"
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    className="text-2xl font-bold fill-current"
                  >
                    {cooldownSeconds}
                  </text>
                </svg>
                <p className="text-sm text-muted-foreground">
                  You can resend in {cooldownSeconds}s
                </p>
              </div>
            ) : (
              <Button
                onClick={handleResend}
                variant="outline"
                className="w-full h-11"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Resending...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>
            )}
          </div>

          {/* Back to form */}
          <button
            onClick={() => {
              setPageState("form");
              setError("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            ← Back to signup form
          </button>
        </div>
      </>
    );
  }

  // ─── SIGNUP FORM STATE (default) ───
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
          {error.includes("expired") || error.includes("verification") ? (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
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

        {/* Gender & Date of Birth (optional, side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select
              value={gender}
              onValueChange={(value) => {
                setGender(value);
                clearError();
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="gender" className="h-11">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of birth{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              disabled={isLoading}
              className="h-11"
              max={new Date().toISOString().split("T")[0]}
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                clearError();
              }}
            />
          </div>
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
                        : "bg-border",
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
                          : "text-muted-foreground",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3 shrink-0",
                          passed ? "opacity-100" : "opacity-30",
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
                  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30",
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
            <p className="text-xs text-destructive">Passwords do not match.</p>
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
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
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
