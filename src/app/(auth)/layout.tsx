"use client";

import Link from "next/link";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BarChart3,
} from "lucide-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Auto-generate test cases from user stories with LLM",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description: "Comprehensive test plans, suites, and coverage tracking",
  },
  {
    icon: BarChart3,
    title: "Insights & Reports",
    description: "Visualize QA metrics and team performance at a glance",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <div className="bg-background min-h-screen flex transition-colors duration-300">
      {/* Theme toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ModeToggle />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 relative overflow-hidden bg-primary dark:bg-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.1)_0%,_transparent_60%)]" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                QA Artifacts
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                Ship with
                <br />
                confidence.
              </h2>
              <p className="mt-4 text-white/70 text-base leading-relaxed max-w-sm">
                AI-driven test case generation that transforms your user stories
                into thorough quality assurance coverage.
              </p>
            </div>

            <div className="space-y-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="h-4.5 w-4.5 text-white/90" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {f.title}
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40 font-medium">
            &copy; 2026 QA Artifacts Inc.
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
