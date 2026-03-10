import type { Metadata } from "next";
import "./styles/index.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { LayoutShell } from "./components/layout-shell";

export const metadata: Metadata = {
  title: "PIXO",
  description: "A modern blogging platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-['Inter',sans-serif] transition-colors duration-300">
        <ThemeProvider>
          <TRPCProvider>
            <LayoutShell>{children}</LayoutShell>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
