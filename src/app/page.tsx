"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Logo } from "@/components/ui/logo";
import {
  ArrowRight,
  FileText,
  ClipboardList,
  Folder,
  BarChart3,
  Users,
  Cpu,
  Menu,
  X,
  Zap,
} from "lucide-react";

/* ─────────── Data ─────────── */

const features = [
  {
    icon: Cpu,
    title: "AI-Powered Generation",
    description:
      "Generate comprehensive test cases from user stories and acceptance criteria using advanced AI models.",
  },
  {
    icon: FileText,
    title: "User Story Management",
    description:
      "Organize and manage user stories with acceptance criteria, priorities, and status tracking.",
  },
  {
    icon: ClipboardList,
    title: "Test Plan Builder",
    description:
      "Create detailed test plans linked to projects with progress tracking and team assignments.",
  },
  {
    icon: Folder,
    title: "Test Suite Organization",
    description:
      "Group and categorize test cases into logical suites for streamlined execution workflows.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Visualize test coverage, pass rates, and quality metrics through interactive dashboards.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite team members, assign roles, and collaborate across workspaces and projects in real-time.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a Workspace",
    description:
      "Set up your workspace and invite team members. Organize projects under a single shared environment.",
    icon: Folder,
  },
  {
    step: "02",
    title: "Add User Stories",
    description:
      "Import or write user stories with acceptance criteria. Define the behavior your software should exhibit.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Generate with AI",
    description:
      "Select stories and criteria, then let AI generate detailed, production-ready test cases in seconds.",
    icon: Zap,
  },
];

/* ─────────── Component ─────────── */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Logo />

          {/* Nav Links - Desktop */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <ModeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden animate-slide-down">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <AnimatedSection delay={100}>
              <h1 className="font-heading text-4xl leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                Test cases from user stories,{" "}
                <span className="text-primary">in seconds.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Write a user story. Get structured test cases — steps,
                preconditions, expected results. AI handles the tedious part
                so your team ships with confidence.
              </p>
            </AnimatedSection>

            {/* CTA Button */}
            <AnimatedSection delay={300}>
              <div className="mt-10 flex justify-center">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero visual - Dashboard screenshot */}
          <AnimatedSection
            delay={400}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-black/5 dark:shadow-black/20">
              <div className="overflow-hidden rounded-xl border border-border">
                {/* Browser bar */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <div className="ml-3 flex h-7 flex-1 items-center rounded-md bg-background px-3 text-xs text-muted-foreground">
                    quraex.com/workspaces
                  </div>
                </div>
                {/* Screenshot */}
                <Image
                  src="/dashboard-preview.png"
                  alt="QuraEx Dashboard Preview"
                  width={1200}
                  height={675}
                  className="w-full"
                  priority
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Features
              </p>
              <h2 className="mt-3 text-3xl tracking-tight sm:text-4xl">
                Everything You Need for Modern QA
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A complete platform to manage your testing lifecycle — from user
                stories to generated test cases and beyond.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <AnimatedSection key={feature.title} delay={idx * 100}>
                <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:shadow-md">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how-it-works"
        className="border-t border-border bg-muted/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                How It Works
              </p>
              <h2 className="mt-3 text-3xl tracking-tight sm:text-4xl">
                Three Steps to Better Testing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get from user story to complete test coverage in minutes, not
                days.
              </p>
            </div>
          </AnimatedSection>

          <div className="relative mt-16">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-[72px] hidden h-px bg-border lg:block" />

            <div className="grid gap-8 lg:grid-cols-3">
              {steps.map((item, idx) => (
                <AnimatedSection key={item.step} delay={idx * 150}>
                  <div className="relative rounded-xl border border-border bg-card p-8 text-center transition-all hover:shadow-md">
                    <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Step {item.step}
                    </span>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Generate structured test cases from user stories. Ship quality
                software with confidence.
              </p>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-border pt-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} QuraEx. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
