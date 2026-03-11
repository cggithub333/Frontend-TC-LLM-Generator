import Link from "next/link";
import { ModeToggle } from "@/components/layout/mode-toggle";

const EFFECTIVE_DATE = "March 11, 2026";
const LAST_UPDATED = "March 11, 2026";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Sign In", href: "/login" },
  { label: "Sign Up", href: "/signup" },
];

const TABLE_OF_CONTENTS = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "description", label: "2. Description of Service" },
  { id: "accounts", label: "3. User Accounts" },
  { id: "acceptable-use", label: "4. Acceptable Use" },
  { id: "intellectual-property", label: "5. Intellectual Property" },
  { id: "ai-generated-content", label: "6. AI-Generated Content" },
  { id: "third-party-services", label: "7. Third-Party Services" },
  { id: "limitation-of-liability", label: "8. Limitation of Liability" },
  { id: "termination", label: "9. Termination" },
  { id: "changes", label: "10. Changes to These Terms" },
  { id: "contact", label: "11. Contact" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-[11px] font-bold leading-none">
              QA
            </div>
            <span className="text-sm font-semibold tracking-tight">
              QA Artifact
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-5 sm:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <article className="mx-auto max-w-4xl rounded-xl border border-border bg-background px-6 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          {/* Title block */}
          <header className="mb-10 sm:mb-14">
            <h1 className="text-3xl font-bold tracking-tight sm:text-[2.25rem]">
              Terms of Service
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>Effective: {EFFECTIVE_DATE}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Last updated: {LAST_UPDATED}</span>
            </div>
            <div className="mt-8 h-px bg-border" />
          </header>

          {/* Table of contents */}
          <nav className="mb-12 sm:mb-16 rounded-lg border border-border bg-muted/40 px-5 py-5 sm:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Table of Contents
            </p>
            <ol className="columns-1 gap-x-10 space-y-2 text-[13px] sm:text-sm sm:columns-2">
              {TABLE_OF_CONTENTS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-10 sm:space-y-14 text-[15px] leading-7 text-muted-foreground">
            {/* 1 */}
            <section id="acceptance" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using QA Artifact (&ldquo;the Application&rdquo;),
                you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
                If you do not agree to all of these Terms, you may not access or use
                the Application.
              </p>
              <p className="mt-4">
                These Terms apply to all users of the Application, including
                registered account holders, team members invited to workspaces, and
                any other visitors who access the service.
              </p>
            </section>

            {/* 2 */}
            <section id="description" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                2. Description of Service
              </h2>
              <p>
                QA Artifact is an AI-powered quality assurance platform that enables
                users to generate QA Test Cases from User Stories. The Application
                provides features including:
              </p>
              <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
                <li>AI-powered test case generation from user stories and acceptance criteria.</li>
                <li>User story management with status tracking and prioritization.</li>
                <li>Test plan and test suite organization.</li>
                <li>Workspace and project collaboration with role-based access.</li>
                <li>Reports and analytics dashboards.</li>
              </ul>
            </section>

            {/* 3 */}
            <section id="accounts" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                3. User Accounts
              </h2>
              <p>
                To use QA Artifact, you must create an account by providing your
                full name, email address, and a password. You agree to:
              </p>
              <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
                <li>Provide accurate and complete registration information.</li>
                <li>Maintain the security and confidentiality of your account credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts that violate
                these Terms or are used for unauthorized purposes.
              </p>
            </section>

            {/* 4 */}
            <section id="acceptable-use" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                4. Acceptable Use
              </h2>
              <p>You agree not to use QA Artifact to:</p>
              <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
                <li>Violate any applicable laws or regulations.</li>
                <li>Submit content that is harmful, abusive, defamatory, or illegal.</li>
                <li>Attempt to gain unauthorized access to the Application or its systems.</li>
                <li>Interfere with or disrupt the integrity or performance of the service.</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Application.</li>
                <li>Use automated tools to scrape, crawl, or extract data from the service.</li>
              </ul>
            </section>

            {/* 5 */}
            <section id="intellectual-property" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                5. Intellectual Property
              </h2>
              <p>
                The Application, including its design, source code, logos, and
                documentation, is the intellectual property of the QA Artifact
                development team and is protected by applicable intellectual property
                laws.
              </p>
              <p className="mt-4">
                You retain ownership of any User Story content and other data you
                submit to the Application. By using the service, you grant us a
                limited, non-exclusive license to process your content solely for the
                purpose of providing the service.
              </p>
            </section>

            {/* 6 */}
            <section id="ai-generated-content" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                6. AI-Generated Content
              </h2>
              <p>
                QA Artifact uses third-party Large Language Model (LLM) APIs to
                generate test cases. You acknowledge and agree that:
              </p>
              <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
                <li>
                  AI-generated test cases are provided as suggestions and should be
                  reviewed by qualified personnel before use in production environments.
                </li>
                <li>
                  We do not guarantee the accuracy, completeness, or suitability of
                  any AI-generated content.
                </li>
                <li>
                  You are solely responsible for reviewing, editing, and validating all
                  generated test cases before relying on them.
                </li>
              </ul>
            </section>

            {/* 7 */}
            <section id="third-party-services" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                7. Third-Party Services
              </h2>
              <p>
                The Application integrates with third-party services, including LLM
                API providers, for content processing. We are not responsible for the
                practices, policies, or availability of these third-party services.
              </p>
              <p className="mt-4">
                User Story content submitted for test case generation is sent to the
                LLM provider solely for processing your request. This data is not
                used to train or improve any AI models. Please refer to our{" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
                  Privacy Policy
                </Link>{" "}
                for more details on data handling.
              </p>
            </section>

            {/* 8 */}
            <section id="limitation-of-liability" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, QA Artifact and
                its developers shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of or related
                to your use of the Application.
              </p>
              <p className="mt-4">
                The Application is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis without warranties of any kind, either express
                or implied, including but not limited to implied warranties of
                merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
            </section>

            {/* 9 */}
            <section id="termination" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                9. Termination
              </h2>
              <p>
                We may terminate or suspend your access to the Application at any
                time, with or without cause, and with or without notice. Upon
                termination, your right to use the Application will immediately
                cease.
              </p>
              <p className="mt-4">
                You may also delete your account at any time. Upon account deletion,
                we will remove your personal data in accordance with our{" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            {/* 10 */}
            <section id="changes" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                10. Changes to These Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. If
                significant changes are made, we will notify registered users via
                email or through an in-app notice. Continued use of QA Artifact
                after changes are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* 11 */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="mb-4 text-[17px] font-semibold text-foreground">
                11. Contact
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <p className="mt-3 font-medium text-foreground">
                qa.artifact.swd391@gmail.com
              </p>
            </section>
          </div>

          {/* Bottom note */}
          <div className="mt-14 sm:mt-16 h-px bg-border" />
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            This document is provided for academic purposes as part of the SWD391
            course project at FPT University.
          </p>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted-foreground lg:px-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-background text-[8px] font-bold leading-none">
              QA
            </div>
            <span className="text-xs font-medium text-foreground">
              QA Artifact
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <a href="mailto:qa.artifact.swd391@gmail.com" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          <p className="text-xs">
            &copy; {new Date().getFullYear()} QA Artifact
          </p>
        </div>
      </footer>
    </div>
  );
}
