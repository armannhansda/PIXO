"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/trpc";
import { IMAGES } from "../components/mock-data";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            el: HTMLElement,
            config: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const loginMutation = api.auth.login.useMutation({
    onSuccess: () => {
      localStorage.setItem("authToken", "true");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => setError(err.message),
  });

  const signupMutation = api.auth.signup.useMutation({
    onSuccess: () => {
      localStorage.setItem("authToken", "true");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => setError(err.message),
  });

  const googleLoginMutation = api.auth.googleLogin.useMutation({
    onSuccess: () => {
      localStorage.setItem("authToken", "true");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => setError(err.message),
  });

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          googleLoginMutation.mutate({ credential: response.credential });
        },
      });
      if (googleBtnRef.current) {
        window.google?.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: googleBtnRef.current.offsetWidth,
          text: "continue_with",
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = loginMutation.isPending || signupMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      signupMutation.mutate({ name, email, password });
    }
  };

  return (
    <div className="min-h-screen flex font-body bg-bg text-fg transition-colors duration-300">
      {/* Form Container */}
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-12 bg-bg relative">
        {/* Back Button */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-heading text-sm font-medium z-20"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        {/* Ambient Glows */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(232,160,35,0.08) 0%, transparent 70%)",
          }}
        />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 font-heading text-2xl font-bold" style={{ color: "var(--accent)" }}>
            PIXO<span style={{ color: "var(--fg)" }}>.</span>
          </Link>

          <h1 className="mb-2 font-heading text-3xl font-bold" style={{ color: "var(--fg)" }}>
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-[var(--muted)] mb-8" style={{ fontSize: 15 }}>
            {isLogin
              ? "Enter your credentials to access your account."
              : "Fill in the details to get started."}
          </p>

          {/* Google Button */}
          <div
            ref={googleBtnRef}
            className="w-full mb-6 flex justify-center rounded-xl bg-white text-black overflow-hidden"
          />

          {googleLoginMutation.isPending && (
            <div
              className="flex items-center justify-center gap-2 mb-4 text-[var(--muted)]"
              style={{ fontSize: 14 }}
            >
              <Loader2 size={16} className="animate-spin" />
              Signing in with Google...
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[var(--muted)]" style={{ fontSize: 12 }}>
              or
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500"
                style={{ fontSize: 14 }}
              >
                {error}
              </div>
            )}
            {!isLogin && (
              <div>
                <label
                  className="block mb-1.5 font-heading font-semibold"
                  style={{ fontSize: 13, color: "var(--fg)" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-4 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--fg)] font-body email-input focus:ring-2 focus:ring-[var(--accent)] transition-all"
                    style={{ fontSize: 14 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className="block mb-1.5 font-heading font-semibold"
                style={{ fontSize: 13, color: "var(--fg)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--fg)] font-body email-input focus:ring-2 focus:ring-[var(--accent)] transition-all"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="font-heading font-semibold" style={{ fontSize: 13, color: "var(--fg)" }}>
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => toast.error("Password recovery is currently disabled.")}
                    className="text-[var(--accent)] hover:text-[var(--fg)] font-heading transition-colors"
                    style={{ fontSize: 13, fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--fg)] font-body email-input focus:ring-2 focus:ring-[var(--accent)] transition-all"
                  style={{ fontSize: 14 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye-slash text-sm"></i>
                  ) : (
                    <i className="fa-solid fa-eye text-sm"></i>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)] border border-[var(--accent)] rounded-xl transition-all duration-300 mt-4 disabled:opacity-50 flex items-center justify-center gap-2 font-heading font-bold text-sm cursor-pointer"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          <p
            className="text-center mt-6 text-[var(--muted)]"
            style={{ fontSize: 14 }}
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-[var(--accent)] hover:text-[var(--fg)] font-heading transition-colors"
              style={{ fontWeight: 600 }}
            >
              {isLogin ? "Create account" : "Log in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
