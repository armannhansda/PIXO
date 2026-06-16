import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./styles/index.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { LayoutShell } from "./components/layout-shell";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "PIXO | Modern Publishing",
    template: "%s | PIXO",
  },
  description: "A modern, fast, and beautiful platform for writers and readers.",
  openGraph: {
    title: "PIXO | Modern Publishing",
    description: "A modern, fast, and beautiful platform for writers and readers.",
    url: "https://pixo.app",
    siteName: "PIXO",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200&h=630",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PIXO | Modern Publishing",
    description: "A modern, fast, and beautiful platform for writers and readers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`min-h-screen bg-bg font-body text-fg transition-colors duration-300 ${spaceGrotesk.variable} ${dmSans.variable}`}>
        <ThemeProvider>
          <TRPCProvider>
            <LayoutShell>{children}</LayoutShell>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
