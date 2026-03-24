import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6 lg:px-8">
          <Logo size="sm" />

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted-foreground lg:px-8 sm:flex-row sm:justify-between">
          <Logo size="sm" />

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
            &copy; {new Date().getFullYear()} QuraEx
          </p>
        </div>
      </footer>
    </div>
  );
}
