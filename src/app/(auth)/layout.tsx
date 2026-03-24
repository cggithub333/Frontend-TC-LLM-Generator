"use client";

import Link from "next/link";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  ArrowLeft,
  Quote,
} from "lucide-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="en">
    <div className="bg-background min-h-screen flex transition-colors duration-300">
      {/* Theme toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ModeToggle />
      </div>

      {/* Left branding panel — streamlined */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 relative overflow-hidden bg-primary dark:bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div className="flex items-center justify-between">
            <Logo variant="white" />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl text-white leading-tight">
                Ship with
                <br />
                confidence.
              </h2>
              <p className="mt-4 text-white/70 text-base leading-relaxed max-w-sm">
                Transform user stories into comprehensive test coverage — automatically.
              </p>
            </div>

            {/* Social proof */}
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-5 space-y-3">
              <Quote className="h-5 w-5 text-white/50" />
              <p className="text-sm text-white/90 leading-relaxed italic">
                &ldquo;QuraEx cut our test planning time by 60%. The AI-generated test cases catch edge cases we used to miss.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white">
                  TN
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Thanh Nguyen</p>
                  <p className="text-xs text-white/50">QA Lead, FPT Software</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/40 font-medium">
            &copy; 2026 QuraEx.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground mb-6 -ml-2 lg:hidden"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          {children}
        </div>
      </main>
    </div>
    </GoogleOAuthProvider>
  );
}
