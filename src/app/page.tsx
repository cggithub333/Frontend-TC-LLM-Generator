"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  ArrowRight,
  FileText,
  ClipboardList,
  Folder,
  BarChart3,
  Users,
  Cpu,
  ChevronRight,
  Github,
  Menu,
  X,
  Quote,
  ChevronDown,
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

const testimonials = [
  {
    quote:
      "QA Artifacts cut our test case writing time by 80%. What used to take a full sprint now takes a single afternoon.",
    name: "Sarah Chen",
    role: "QA Lead at FinStack",
    avatar: "SC",
  },
  {
    quote:
      "The AI-generated test cases are remarkably thorough. It catches edge cases our team would have missed entirely.",
    name: "Marcus Johnson",
    role: "Engineering Manager at Cloudlift",
    avatar: "MJ",
  },
  {
    quote:
      "Finally a platform that understands QA workflows. The workspace and test suite organization is exactly what we needed.",
    name: "Priya Sharma",
    role: "Senior QA Engineer at DataPulse",
    avatar: "PS",
  },
];

const faqs = [
  {
    question: "How does AI test case generation work?",
    answer:
      "You provide user stories and acceptance criteria, and our AI analyzes the requirements to generate comprehensive test cases with steps, preconditions, expected results, and test data. The AI covers positive, negative, and edge case scenarios automatically.",
  },
  {
    question: "Can I customize the generated test cases?",
    answer:
      "Absolutely. Generated test cases are fully editable. You can modify steps, add custom fields, adjust priorities, and reorganize them into test suites before saving. Think of AI as your starting point, not the final word.",
  },
  {
    question: "Does QA Artifacts integrate with Jira?",
    answer:
      "Yes. You can link projects to Jira, import user stories directly via Jira issue keys, and sync acceptance criteria. This keeps your QA artifacts connected to your existing project management workflow.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is a core priority. We use JWT-based authentication, role-based access control, encrypted data in transit and at rest, and follow OWASP best practices. Your test data never leaves your workspace.",
  },
  {
    question: "How many team members can I invite?",
    answer:
      "There is no hard limit. You can invite as many team members as your plan supports, assign them roles (Admin, QA Lead, Tester, Viewer), and manage access at both workspace and project levels.",
  },
];

/* ─────────── Component ─────────── */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <span className="text-sm font-bold">QA</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              QA Artifacts
            </span>
          </Link>

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
            <a
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </a>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <ModeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/workspaces">
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
          <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
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
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/workspaces">
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
            {/* Badge */}
            <AnimatedSection delay={0}>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
                AI-Powered QA Platform
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                Ship quality software,{" "}
                <span className="text-primary">faster.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Generate comprehensive test cases from user stories in seconds.
                QA Artifacts combines AI intelligence with structured QA
                workflows so your team can focus on building, not writing tests.
              </p>
            </AnimatedSection>

            {/* CTA Buttons */}
            <AnimatedSection delay={300}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/workspaces">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">
                    See How It Works
                    <ChevronRight className="ml-1 h-4 w-4" />
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
            <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/5 dark:shadow-black/20">
              <div className="overflow-hidden rounded-xl border border-border">
                {/* Browser bar */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="ml-3 flex h-7 flex-1 items-center rounded-md bg-background px-3 text-xs text-muted-foreground">
                    quraex.com/workspaces
                  </div>
                </div>
                {/* Screenshot */}
                <Image
                  src="/dashboard-preview.png"
                  alt="QA Artifacts Dashboard Preview"
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
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
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
                <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:shadow-md">
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
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
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
                  <div className="relative rounded-2xl border border-border bg-card p-8 text-center transition-all hover:shadow-md">
                    <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
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


      {/* ─── Testimonials ─── */}
      <section
        id="testimonials"
        className="border-t border-border bg-muted/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Testimonials
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by QA Teams Everywhere
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what quality assurance professionals are saying about QA
                Artifacts.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <AnimatedSection key={t.name} delay={idx * 150}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                  <Quote className="mb-4 h-8 w-8 text-muted-foreground/30" />
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedSection>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about QA Artifacts.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, idx) => (
              <AnimatedSection key={idx} delay={idx * 80}>
                <div className="rounded-xl border border-border bg-card transition-all hover:border-primary/20">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="pr-4 text-sm font-semibold">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === idx ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16 sm:py-20">
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to Transform Your QA Workflow?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                  Join thousands of QA teams using AI to generate better test
                  cases, faster. Start for free — no credit card required.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                  >
                    <Link href="/workspaces">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                    asChild
                  >
                    <Link href="/login">
                      Sign In
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                  QA
                </div>
                <span className="font-bold tracking-tight">QA Artifacts</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                AI-powered test case generation platform for modern QA teams.
                Ship quality software with confidence.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Pricing", href: "#" },
                  { label: "Changelog", href: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="mt-3 space-y-2.5">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-3 space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Security", href: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} QA Artifacts Inc. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
