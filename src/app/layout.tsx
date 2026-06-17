import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./styles/index.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { LayoutShell } from "./components/layout-shell";
import { Analytics } from '@vercel/analytics/next';

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "PIXO - Share Your Stories",
  description:
    "A modern blogging platform for writers and creators.",

  openGraph: {
    title: "PIXO - Share Your Stories",
    description:
      "A modern blogging platform for writers and creators.",
    url: "https://pixo.armanx.online",
    siteName: "PIXO",
    images: [
      {
        url: "https://pixo.armanx.online",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PIXO - Share Your Stories",
    description:
      "A modern blogging platform for writers and creators.",
    images: ["https://pixo.armanx.online"],
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
        <Analytics />
      </body>
    </html>
  );
}
