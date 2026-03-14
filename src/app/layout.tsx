import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QA Artifacts - AI-Powered Testing Platform",
  description: "Professional QA Management Platform with AI-powered test case generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          closeButton
          theme="dark"
          toastOptions={{
            className: "sonner-toast-custom",
            style: {
              background: "hsl(0 0% 13% / 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              color: "hsl(0 0% 95%)",
              boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(0 0% 100% / 0.05)",
              borderRadius: "12px",
              fontSize: "13px",
              padding: "14px 16px",
            },
          }}
        />
      </body>
    </html>
  );
}
