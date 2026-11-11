
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Validate individual fields
  const validateEmail = (value: string) => {
    const trimmedEmail = value.trim();

    if (!trimmedEmail) {
      return "Email address is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required.";
    }

    if (value.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  // Validate complete form
  const validateForm = () => {
    const newErrors: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  // Handle email change
  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (submitted) {
      setErrors((previous) => ({
        ...previous,
        email: validateEmail(value),
      }));
    }
  };

  // Handle password change
  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (submitted) {
      setErrors((previous) => ({
        ...previous,
        password: validatePassword(value),
      }));
    }
  };

  // Login
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the errors before signing in.");
      return;
    }

    try {
      setLoading(true);

      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message || "Login failed.");
        return;
      }

      toast.success("Welcome back to Kindora!");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border bg-[#FFFDF9] py-3.5 pl-11 pr-4 text-sm text-[#26382D] outline-none transition placeholder:text-[#A0A99F] focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10";

  return (
    <main className="min-h-screen bg-[#FFF9F1] lg:flex">
      {/* Left Hero Section */}
      <section className="relative hidden overflow-hidden bg-[#174B35] px-12 py-12 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-[#E99A62]/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#DCE9DD]/10 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E99A62] text-[#174B35]">
            <Heart size={24} fill="currentColor" />
          </div>

          <span className="text-2xl font-bold tracking-tight">
            Kindora<span className="text-[#E99A62]">.</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium tracking-wider text-[#F4E7D8]">
            WELCOME BACK
          </span>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Together, we can make a{" "}
            <span className="text-[#E99A62]">difference.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-white/70">
            Continue your journey with Kindora. Discover meaningful events,
            connect with people, and create positive change in your community.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["M", "A", "S", "R"].map((letter, index) => (
                <div
                  key={letter}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#174B35] bg-[#DCE9DD] text-sm font-bold text-[#174B35]"
                  style={{ zIndex: 4 - index }}
                >
                  {letter}
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold">
                Be part of something good
              </p>
              <p className="text-xs text-white/60">
                Connect. Participate. Make an impact.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © 2026 Kindora. Making communities stronger.
        </p>
      </section>

      {/* Login Section */}
      <section className="flex min-h-screen flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-115">
          {/* Mobile Brand */}
          <Link
            href="/"
            className="mb-10 flex items-center justify-center gap-2 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174B35] text-[#E99A62]">
              <Heart size={22} fill="currentColor" />
            </div>

            <span className="text-2xl font-bold text-[#174B35]">
              Kindora<span className="text-[#E99A62]">.</span>
            </span>
          </Link>

          <div className="rounded-2xl border border-[#EFE9DF] bg-white p-6 shadow-[0_15px_50px_rgba(38,56,45,0.06)] sm:p-9">
            <div className="mb-8">
              <span className="text-sm font-semibold text-[#E99A62]">
                WELCOME BACK
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#26382D]">
                Sign in to Kindora
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#849087]">
                Enter your details to access your account and continue making
                an impact.
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#26382D]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA59B]"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => {
                      if (submitted) {
                        setErrors((previous) => ({
                          ...previous,
                          email: validateEmail(email),
                        }));
                      }
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`${inputClass} ${
                      errors.email ? "border-red-500" : "border-[#E5E9E3]"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#26382D]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Password recovery will be added later.")
                    }
                    className="text-xs font-semibold text-[#174B35] transition hover:text-[#E99A62]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA59B]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={`${inputClass} pr-12 ${
                      errors.password ? "border-red-500" : "border-[#E5E9E3]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA59B] hover:text-[#174B35]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#174B35]"
                />

                <span className="text-sm text-[#657268]">
                  Remember me
                </span>
              </label>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B35] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#174B35]/10 transition hover:bg-[#103D2A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#ECEFEA]" />

              <span className="text-xs font-medium text-[#A0A99F]">
                OR CONTINUE WITH
              </span>

              <div className="h-px flex-1 bg-[#ECEFEA]" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  toast.info("Google login will be configured later.")
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E9E3] py-3 text-sm font-semibold text-[#26382D] transition hover:bg-[#FFF9F1]"
              >
                <svg viewBox="0 0 48 48" className="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.74 7.18l7.32 5.68c4.27-3.94 7.46-9.73 7.46-17.33Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.32-5.68c-2.03 1.36-4.63 2.16-8.59 2.16-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() =>
                  toast.info("GitHub login will be configured later.")
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E9E3] py-3 text-sm font-semibold text-[#26382D] transition hover:bg-[#FFF9F1]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#26382D]">
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.63 1.21 3.27.93.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.28-2.62 5.22-5.11 5.5.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
                GitHub
              </button>
            </div>

            <p className="mt-7 text-center text-sm text-[#849087]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#174B35] transition hover:text-[#E99A62]"
              >
                Create account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#A0A99F]">
            By continuing, you agree to Kindora&apos;s Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
