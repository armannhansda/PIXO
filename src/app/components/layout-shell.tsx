"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./navbar";

const HIDE_NAVBAR_ROUTES = ["/login", "/signup"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = HIDE_NAVBAR_ROUTES.includes(pathname) || pathname.startsWith("/write");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
      <Toaster position="bottom-right" />
    </>
  );
}
