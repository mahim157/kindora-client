"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Users,
  Globe2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface FormErrors {
  name?: string;
  email?: string;
  photoURL?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const inputClass =
    "w-full rounded-xl border bg-[#FFFEFC] px-4 py-3.5 text-sm text-[#26382D] outline-none transition-all placeholder:text-[#AAA69D] hover:border-[#C7D5C8] focus:border-[#78947E] focus:ring-4 focus:ring-[#DCE9DD]/60";

  // Validation functions
  const validateName = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return "Full name is required.";
    if (trimmed.length < 2)
      return "Name must be at least 2 characters.";
    if (trimmed.length > 80)
      return "Name cannot exceed 80 characters.";

    return "";
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return "Email address is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed))
      return "Please enter a valid email address.";

    return "";
  };

  const validatePhotoURL = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return "";

    try {
      const url = new URL(trimmed);

      if (
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname.includes(".")
      ) {
        return "Please enter a valid HTTP or HTTPS photo URL.";
      }

      return "";
    } catch {
      return "Please enter a valid photo URL.";
    }
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required.";

    if (value.length < 6)
      return "Password must be at least 6 characters.";

    if (!/[A-Z]/.test(value))
      return "Password must contain an uppercase letter.";

    if (!/[a-z]/.test(value))
      return "Password must contain a lowercase letter.";

    return "";
  };

  const validateConfirmPassword = (
    value: string,
    currentPassword: string
  ) => {
    if (!value) return "Please confirm your password.";

    if (value !== currentPassword)
      return "Passwords do not match.";

    return "";
  };

  // Validate complete form
  const validateForm = () => {
    const newErrors: FormErrors = {
      name: validateName(name),
      email: validateEmail(email),
      photoURL: validatePhotoURL(photoURL),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(
        confirmPassword,
        password
      ),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  // Revalidate changed fields after submission
  const updateError = (
    field: keyof FormErrors,
    value: string
  ) => {
    if (!submitted) return;

    let error = "";

    switch (field) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "photoURL":
        error = validatePhotoURL(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, password);
        break;
    }

    setErrors((previous) => ({
      ...previous,
      [field]: error,
      ...(field === "password"
        ? {
            confirmPassword: validateConfirmPassword(
              confirmPassword,
              value
            ),
          }
        : {}),
    }));
  };

  // Registration Handler
  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the errors before creating your account.");
      return;
    }

    try {
      setLoading(true);

      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(photoURL.trim()
          ? { image: photoURL.trim() }
          : {}),
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      toast.success("Account created successfully!");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Social Sign-up / Login Handler (Google & GitHub)
  const handleSocialSignUp = async (provider: "google" | "github") => {
    try {
      setSocialLoading(provider);

      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (result?.error) {
        toast.error(
          result.error.message || `Failed to continue with ${provider}.`
        );
        setSocialLoading(null);
      }
    } catch (error) {
      console.error(`${provider} sign-up error:`, error);
      toast.error("Something went wrong. Please try again.");
      setSocialLoading(null);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#FFF9F1] text-[#26382D]">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-[#F4E7D8]/70 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-[#DCE9DD]/60 blur-3xl" />

      {/* Left Hero Section */}
      <section className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#123D2B] via-[#174B35] to-[#286747] p-12 text-white lg:flex xl:p-16">
        <div className="absolute -right-32 -top-32 h-[430px] w-[430px] rounded-full border border-white/10" />

        <div className="absolute -right-16 -top-16 h-[300px] w-[300px] rounded-full border border-white/10" />

        <div className="absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-[#E99A62]/10 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-[#E99A62] p-3 text-[#174B35] shadow-lg shadow-black/10">
            <HeartHandshake size={28} />
          </div>

          <span className="text-2xl font-extrabold tracking-tight">
            Kindora<span className="text-[#E99A62]">.</span>
          </span>
        </Link>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-[#F4E7D8] backdrop-blur-md">
            <Sparkles size={16} className="text-[#E99A62]" />
            Together, We Make a Difference
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight xl:text-6xl">
            Small actions.
            <br />
            <span className="text-[#F1B486]">
              Meaningful impact.
            </span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-8 text-[#E3EDE5] xl:text-lg">
            Discover meaningful community events, connect with inspiring
            people, and make a positive difference in the world around you.
          </p>

          {/* Feature Cards */}
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm transition hover:bg-white/[0.12]">
              <div className="mb-4 inline-flex rounded-xl bg-[#E99A62]/15 p-3">
                <Users size={24} className="text-[#F1B486]" />
              </div>

              <h3 className="font-bold">Connect</h3>

              <p className="mt-2 text-xs leading-5 text-[#D5E4D9]">
                Meet people who share your passion.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm transition hover:bg-white/[0.12]">
              <div className="mb-4 inline-flex rounded-xl bg-[#E99A62]/15 p-3">
                <Globe2 size={24} className="text-[#F1B486]" />
              </div>

              <h3 className="font-bold">Make Impact</h3>

              <p className="mt-2 text-xs leading-5 text-[#D5E4D9]">
                Bring positive change to your community.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#C9D9CE]">
          © 2026 Kindora. Building stronger communities.
        </p>
      </section>

      {/* Right Registration Section */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-[490px]">
          {/* Mobile Logo */}
          <Link
            href="/"
            className="mb-7 flex items-center gap-2 text-2xl font-extrabold text-[#174B35] lg:hidden"
          >
            <HeartHandshake size={29} />
            Kindora<span className="text-[#E99A62]">.</span>
          </Link>

          {/* Registration Card */}
          <div className="rounded-[28px] border border-[#EEE8DE] bg-white p-6 shadow-[0_20px_70px_rgba(38,56,45,0.07)] sm:p-9">
            <div className="mb-6">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E9D9C8] bg-[#F8EBDD] px-3.5 py-2 text-xs font-bold tracking-wide text-[#8C5736]">
                <Leaf size={15} />
                JOIN THE COMMUNITY
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#26382D] sm:text-[34px]">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#78847A]">
                Your journey towards making a difference starts here.
              </p>
            </div>

            {/* Registration Form */}
            <form
              onSubmit={handleRegister}
              noValidate
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#344239]"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    updateError("name", e.target.value);
                  }}
                  aria-invalid={!!errors.name}
                  className={`${inputClass} ${
                    errors.name ? "border-red-500" : "border-[#E9E5DC]"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#344239]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    updateError("email", e.target.value);
                  }}
                  aria-invalid={!!errors.email}
                  className={`${inputClass} ${
                    errors.email ? "border-red-500" : "border-[#E9E5DC]"
                  }`}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Photo URL */}
              <div>
                <label
                  htmlFor="photoURL"
                  className="mb-2 block text-sm font-semibold text-[#344239]"
                >
                  Profile Photo URL{" "}
                  <span className="font-normal text-[#A49B90]">
                    (Optional)
                  </span>
                </label>

                <input
                  id="photoURL"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={photoURL}
                  onChange={(e) => {
                    setPhotoURL(e.target.value);
                    updateError("photoURL", e.target.value);
                  }}
                  aria-invalid={!!errors.photoURL}
                  className={`${inputClass} ${
                    errors.photoURL ? "border-red-500" : "border-[#E9E5DC]"
                  }`}
                />

                {errors.photoURL && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.photoURL}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#344239]"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      updateError("password", e.target.value);
                    }}
                    aria-invalid={!!errors.password}
                    className={`${inputClass} pr-12 ${
                      errors.password ? "border-red-500" : "border-[#E9E5DC]"
                    }`}
                  />

                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#174B35]"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.password}
                  </p>
                )}

                <p className="mt-2 text-xs text-[#92998F]">
                  Minimum 6 characters, including uppercase and lowercase letters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#344239]"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      updateError("confirmPassword", e.target.value);
                    }}
                    aria-invalid={!!errors.confirmPassword}
                    className={`${inputClass} pr-12 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-[#E9E5DC]"
                    }`}
                  />

                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#174B35]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Create Account */}
              <button
                type="submit"
                disabled={loading || socialLoading !== null}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B35] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#174B35]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#103D2B] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}

                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E9E5DC]" />

              <span className="whitespace-nowrap text-[10px] font-bold tracking-[0.16em] text-[#A39B90]">
                OR SIGN UP WITH
              </span>

              <div className="h-px flex-1 bg-[#E9E5DC]" />
            </div>

            {/* Google and GitHub Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading || socialLoading !== null}
                onClick={() => handleSocialSignUp("google")}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-[#E9E5DC] bg-[#FFFEFC] px-3 py-3.5 text-sm font-semibold text-[#344239] transition duration-300 hover:-translate-y-0.5 hover:border-[#D6A47E] hover:bg-[#FFF7ED] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg viewBox="0 0 48 48" className="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.74 7.18l7.72 6C44.4 37.96 46.98 31.95 46.98 24.55Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.72-6c-2.14 1.45-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.92l-7.97 6.19C6.51 42.62 14.62 48 24 48Z"
                  />
                </svg>

                {socialLoading === "google" ? "Connecting..." : "Google"}
              </button>

              <button
                type="button"
                disabled={loading || socialLoading !== null}
                onClick={() => handleSocialSignUp("github")}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-[#E9E5DC] bg-[#FFFEFC] px-3 py-3.5 text-sm font-semibold text-[#344239] transition duration-300 hover:-translate-y-0.5 hover:border-[#D6A47E] hover:bg-[#FFF7ED] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.76 2.07 3.2 1.59.1-.73.39-1.22.7-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.44.11-2.99 0 0 .95-.3 3.08 1.16a10.7 10.7 0 0 1 5.61 0c2.14-1.46 3.08-1.16 3.08-1.16.61 1.55.23 2.7.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.32-2.64 5.27-5.15 5.55.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
                </svg>

                {socialLoading === "github" ? "Connecting..." : "GitHub"}
              </button>
            </div>

            {/* Security Info */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#89948B]">
              <ShieldCheck size={16} className="text-[#66896F]" />
              Your information is securely managed.
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-[#78847A]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#174B35] transition hover:text-[#E18F58]"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs text-[#A49B90]">
              © 2026 Kindora. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}