"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/trpc";
import { IMAGES } from "../components/mock-data";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            el: HTMLElement,
            config: Record<string, unknown>,
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
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      router.push("/");
    },
    onError: (err) => setError(err.message),
  });

  const signupMutation = api.auth.signup.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      router.push("/");
    },
    onError: (err) => setError(err.message),
  });

  const googleLoginMutation = api.auth.googleLogin.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      router.push("/");
    },
    onError: (err) => setError(err.message),
  });

  // Load Google Identity Services script and render sign-in button
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
    <div className="min-h-screen flex font-['Inter',sans-serif] bg-background transition-colors duration-300">
      {/* Left - Gradient/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={IMAGES.gradient}
          alt="Abstract gradient"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-accent/80 via-accent/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="text-white mb-3"
              style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}
            >
              Share your story
              <br />
              with the world.
            </h2>
            <p
              className="text-white/80 max-w-sm"
              style={{ fontSize: 16, lineHeight: 1.6 }}
            >
              Join thousands of writers and thinkers sharing ideas on PIXO.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <span style={{ fontSize: 24, fontWeight: 700 }}>PIXO</span>
          </Link>

          <h1 className="mb-2" style={{ fontSize: 28, fontWeight: 700 }}>
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-muted-foreground mb-8" style={{ fontSize: 15 }}>
            {isLogin
              ? "Enter your credentials to access your account."
              : "Fill in the details to get started."}
          </p>

          {/* Google Button (rendered by Google Identity Services) */}
          <div
            ref={googleBtnRef}
            className="w-full mb-6 flex justify-center rounded-full"
          />

          {googleLoginMutation.isPending && (
            <div
              className="flex items-center justify-center gap-2 mb-4 text-muted-foreground rounded-full"
              style={{ fontSize: 14 }}
            >
              <Loader2 size={16} className="animate-spin" />
              Signing in with Google...
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>
              or
            </span>
            <div className="flex-1 h-px bg-border" />
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
                  className="block mb-1.5"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-4 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    style={{ fontSize: 14 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-accent hover:text-accent/80"
                    style={{ fontSize: 13, fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  style={{ fontSize: 14 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          <p
            className="text-center mt-6 text-muted-foreground"
            style={{ fontSize: 14 }}
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-accent hover:text-accent/80"
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
