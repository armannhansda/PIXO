"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/trpc";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center font-body bg-[#050505] text-fg relative overflow-hidden px-4">


      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all font-heading text-xs uppercase tracking-wider font-bold z-20 backdrop-blur-md"
      >
        <ArrowLeft size={14} />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <motion.div
        className="w-full max-w-[420px] relative z-10"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glassmorphic Card */}
        <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Card subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-3xl" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-1 font-heading text-3xl font-bold tracking-tight mb-6">
                <span style={{ color: "var(--accent)" }}>PIXO</span><span style={{ color: "var(--fg)" }}>.</span>
              </Link>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-[var(--muted)] font-body text-sm">
                {isLogin ? "Enter your credentials to continue." : "Join our community of creators."}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                type="button"
                onClick={() => { window.location.href = "/api/auth/google"; }}
                className="w-full py-3.5 bg-white text-black hover:bg-gray-100 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-heading font-bold text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = "/api/auth/github"; }}
                className="w-full py-3.5 bg-[#24292F] text-white hover:bg-[#1b1f23] rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-heading font-bold text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[var(--muted)] text-[10px] font-heading uppercase tracking-widest font-semibold">
                Or email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2"
                >
                  <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                  <p>{error}</p>
                </motion.div>
              )}
              
              {!isLogin && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-body focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:bg-white/10 transition-all outline-none text-sm placeholder:text-white/30"
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-body focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:bg-white/10 transition-all outline-none text-sm placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-body focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:bg-white/10 transition-all outline-none text-sm tracking-widest placeholder:tracking-normal placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isLogin && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => toast.error("Password recovery is currently disabled.")}
                      className="text-[var(--muted)] hover:text-white transition-colors text-xs font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-[var(--accent)] text-black hover:bg-white border border-transparent rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 font-heading font-bold text-sm shadow-[0_0_15px_rgba(232,160,35,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center relative z-10">
          <p className="text-white/50 font-body text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-white hover:text-[var(--accent)] font-heading font-bold transition-colors ml-1"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
