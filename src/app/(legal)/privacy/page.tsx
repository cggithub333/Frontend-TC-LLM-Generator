import Link from "next/link";

const EFFECTIVE_DATE = "March 11, 2026";
const LAST_UPDATED = "March 11, 2026";

const TABLE_OF_CONTENTS = [
  { id: "overview", label: "1. Overview" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "information-we-do-not-collect", label: "3. Information We Do Not Collect" },
  { id: "how-we-use-data", label: "4. How We Use Data" },
  { id: "third-party-services", label: "5. Third-Party Services" },
  { id: "data-security", label: "6. Data Security" },
  { id: "user-responsibilities", label: "7. User Responsibilities" },
  { id: "changes-to-this-policy", label: "8. Changes to This Policy" },
  { id: "contact", label: "9. Contact" },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-4xl rounded-xl border border-border bg-background px-6 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      {/* Title block */}
      <header className="mb-10 sm:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-[2.25rem]">
          Privacy Policy
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
        {/* 1. Overview */}
        <section id="overview" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            1. Overview
          </h2>
          <p>
            QuraEx (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the
            Application&rdquo;) is an AI-powered tool that helps users generate
            QA Test Cases from User Stories. This Privacy Policy explains what
            data we collect, how we use it, and the measures we take to protect
            your information.
          </p>
          <p className="mt-4">
            By creating an account or using QuraEx, you agree to the
            practices described in this policy. If you do not agree, please do
            not use the Application.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section id="information-we-collect" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            2. Information We Collect
          </h2>
          <p>
            We collect only the minimum information required to provide our
            service. During account registration, we collect:
          </p>
          <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
            <li>
              <strong className="font-medium text-foreground">Full Name</strong>{" "}
              &mdash; used to personalize your account and display within your
              workspace.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Email Address
              </strong>{" "}
              &mdash; used for authentication, account recovery, and service
              notifications.
            </li>
            <li>
              <strong className="font-medium text-foreground">Password</strong>{" "}
              &mdash; stored securely using industry-standard hashing algorithms.
              Passwords are never stored in plain text.
            </li>
          </ul>
          <p className="mt-4">
            Additionally, User Story content you enter into the application is
            processed to generate QA Test Cases. This content is transmitted to a
            third-party API for processing (see Section 5).
          </p>
        </section>

        {/* 3. Information We Do Not Collect */}
        <section id="information-we-do-not-collect" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            3. Information We Do Not Collect
          </h2>
          <p>
            QuraEx does <strong className="font-medium text-foreground">not</strong> access
            or collect any of the following:
          </p>
          <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
            <li>Camera or microphone access</li>
            <li>GPS or location data</li>
            <li>Web browsing history</li>
            <li>Device sensor information</li>
            <li>Cookies for advertising or tracking purposes</li>
          </ul>
        </section>

        {/* 4. How We Use Data */}
        <section id="how-we-use-data" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            4. How We Use Data
          </h2>
          <p>
            Your data is used exclusively for the following purposes:
          </p>
          <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
            <li>Account creation, authentication, and session management.</li>
            <li>
              Processing User Story content you submit to generate QA Test Cases.
            </li>
            <li>
              Communicating important account updates or service notifications.
            </li>
          </ul>
          <p className="mt-4">
            We do <strong className="font-medium text-foreground">not</strong> use
            your data for advertising, user profiling, behavioral tracking, or
            any purpose beyond delivering the core functionality of QuraEx.
          </p>
        </section>

        {/* 5. Third-Party Services */}
        <section id="third-party-services" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            5. Third-Party Services
          </h2>
          <p>
            When you submit a User Story for test case generation, the content is
            sent to a third-party Large Language Model (LLM) API provider for
            processing.
          </p>
          <p className="mt-4">
            User Story content sent to the LLM provider is used{" "}
            <em>solely</em> to generate QA Test Cases for your request. Your data
            is <strong className="font-medium text-foreground">not</strong> used to
            train, fine-tune, or improve any personal or custom AI models.
          </p>
          <p className="mt-4">
            We do not sell, rent, or share your personal information (name,
            email, password) with any third parties, except as required by
            applicable law.
          </p>
        </section>

        {/* 6. Data Security */}
        <section id="data-security" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            6. Data Security
          </h2>
          <p>
            We implement reasonable technical and organizational measures to
            protect your personal data, including:
          </p>
          <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
            <li>
              Passwords are hashed using industry-standard algorithms before
              storage.
            </li>
            <li>All data in transit is encrypted via HTTPS/TLS.</li>
            <li>
              Access to user data is restricted to authorized personnel only.
            </li>
            <li>
              Authentication is managed through secure, token-based sessions
              (JWT).
            </li>
          </ul>
          <p className="mt-4">
            While no system can guarantee absolute security, we are committed to
            protecting your data to the best of our ability and following
            industry best practices.
          </p>
        </section>

        {/* 7. User Responsibilities */}
        <section id="user-responsibilities" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            7. User Responsibilities
          </h2>
          <p>As a user of QuraEx, you are responsible for:</p>
          <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-muted-foreground/40">
            <li>
              Maintaining the confidentiality of your account credentials.
            </li>
            <li>
              Ensuring that User Story content you submit does not contain
              sensitive personal data, trade secrets, or classified information
              unless you accept the risks associated with third-party processing.
            </li>
            <li>
              Notifying us promptly if you suspect unauthorized access to your
              account.
            </li>
          </ul>
        </section>

        {/* 8. Changes to This Policy */}
        <section id="changes-to-this-policy" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. If significant
            changes are made, we will notify registered users via email or
            through an in-app notice. Continued use of QuraEx after changes
            are posted constitutes acceptance of the revised policy.
          </p>
        </section>

        {/* 9. Contact */}
        <section id="contact" className="scroll-mt-24">
          <h2 className="mb-4 text-[17px] font-semibold text-foreground">
            9. Contact
          </h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            how your data is handled, please contact us at:
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
  );
}
