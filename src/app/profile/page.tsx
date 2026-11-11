
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  CalendarDays,
  Users,
  Pencil,
  Save,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface EventResponse {
  success: boolean;
  count?: number;
  data?: unknown[];
  message?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Event statistics
  const [createdCount, setCreatedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Update name when user data changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Fetch real event statistics
  useEffect(() => {
    if (isPending || !session) return;

    let cancelled = false;

    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);

        const tokenResult = await authClient.token();
        const token = tokenResult.data?.token;

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [createdResponse, joinedResponse] = await Promise.all([
          fetch(`${API_URL}/api/events/mine`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/events/joined`, {
            headers,
            cache: "no-store",
          }),
        ]);

        const [createdResult, joinedResult] =
          (await Promise.all([
            createdResponse.json(),
            joinedResponse.json(),
          ])) as [EventResponse, EventResponse];

        if (!createdResponse.ok || !createdResult.success) {
          throw new Error(
            createdResult.message || "Failed to load created events."
          );
        }

        if (!joinedResponse.ok || !joinedResult.success) {
          throw new Error(
            joinedResult.message || "Failed to load joined events."
          );
        }

        if (!cancelled) {
          setCreatedCount(
            createdResult.count ?? createdResult.data?.length ?? 0
          );

          setJoinedCount(
            joinedResult.count ?? joinedResult.data?.length ?? 0
          );
        }
      } catch (err) {
        console.error("Profile statistics error:", err);

        if (!cancelled) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Unable to load event statistics."
          );
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      cancelled = true;
    };
  }, [isPending, session]);

  // Update profile name
  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await authClient.updateUser({
        name: name.trim(),
      });

      if (result.error) {
        setError(result.error.message || "Failed to update profile.");
        return;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        setPasswordError(
          result.error.message || "Unable to change password."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Password changed successfully!");
      toast.success("Password changed successfully!");
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (isPending || !session || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F1]">
        <Loader2 className="h-8 w-8 animate-spin text-[#174B35]" />
      </div>
    );
  }

  const initial = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-[#FFF9F1] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Page Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-[#E99A62]">
            YOUR ACCOUNT
          </p>

          <h1 className="text-3xl font-bold text-[#174B35] md:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your personal information and account activities.
          </p>
        </div>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-3xl border border-[#DCE9DD] bg-white shadow-sm">

          {/* Green Banner */}
          <div className="relative h-36 overflow-hidden bg-[#174B35]">
            <div className="pointer-events-none absolute -right-5 -top-16 h-40 w-40 rounded-full border-2 border-white/20" />
            <div className="pointer-events-none absolute right-32 top-16 h-32 w-32 rounded-full border-2 border-white/20" />
          </div>

          <div className="px-6 pb-10 md:px-10">

            {/* Profile Header */}
            <div className="relative z-10 mb-8 border-b border-gray-100 pb-8">
              <div className="-mt-14 mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-[#E99A62] text-4xl font-bold text-white shadow-md">
                  {initial}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#174B35]">
                    {user.name || "User"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Kindora Community Member
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setName(user.name || "");
                      setError("");
                      setSuccess("");
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#174B35] px-5 py-3 font-semibold text-white transition hover:bg-[#226344]"
                  >
                    <Pencil size={17} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Messages */}
            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <section>
              <div className="mb-6 flex items-center gap-2">
                <User className="text-[#174B35]" size={22} />
                <h3 className="text-xl font-bold text-[#174B35]">
                  Personal Information
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Full Name
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#DCE9DD] px-4 py-3 outline-none focus:ring-2 focus:ring-[#174B35]"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#F7FAF6] p-4">
                      <User size={19} className="text-[#174B35]" />
                      <span className="font-medium text-gray-700">
                        {user.name || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Email Address
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#F7FAF6] p-4">
                    <Mail size={19} className="shrink-0 text-[#174B35]" />

                    <span className="break-all font-medium text-gray-700">
                      {user.email}
                    </span>

                    <ShieldCheck
                      size={18}
                      className="ml-auto shrink-0 text-green-600"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#174B35] px-6 py-3 font-semibold text-white transition hover:bg-[#226344] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={() => {
                      setName(user.name || "");
                      setIsEditing(false);
                      setError("");
                    }}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </section>

            {/* Event Statistics */}
            <section className="mt-12">
              <div className="mb-6 flex items-center gap-2">
                <CalendarDays className="text-[#174B35]" size={22} />

                <h3 className="text-xl font-bold text-[#174B35]">
                  My Event Statistics
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Created Events */}
                <Link
                  href="/manage-events"
                  className="group rounded-2xl border border-[#DCE9DD] bg-[#F7FAF6] p-6 transition hover:border-[#174B35] hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCE9DD]">
                    <CalendarDays size={24} className="text-[#174B35]" />
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Created Events
                  </p>

                  <h4 className="mt-2 text-4xl font-bold text-[#174B35]">
                    {statsLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      createdCount
                    )}
                  </h4>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#174B35]">
                    Manage Events
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>

                {/* Joined Events */}
                <Link
                  href="/joined-events"
                  className="group rounded-2xl border border-[#F4DFD0] bg-[#FFF8F2] p-6 transition hover:border-[#E99A62] hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE8D9]">
                    <Users size={24} className="text-[#C16D35]" />
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Joined Events
                  </p>

                  <h4 className="mt-2 text-4xl font-bold text-[#174B35]">
                    {statsLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      joinedCount
                    )}
                  </h4>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#174B35]">
                    View Joined Events
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#174B35] hover:underline"
              >
                <RefreshCw size={15} />
                Refresh Statistics
              </button>
            </section>

            {/* Change Password */}
            <section className="mt-12 border-t border-gray-100 pt-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCE9DD]">
                  <LockKeyhole size={22} className="text-[#174B35]" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#174B35]">
                    Account Security
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Keep your account secure by updating your password.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#DCE9DD] bg-[#F7FAF6] p-5 sm:p-7">

                {passwordSuccess && (
                  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-5">

                  {/* Current Password */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Current Password
                    </label>

                    <div className="relative mt-2">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-[#DCE9DD] bg-white px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#174B35]"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        aria-label="Toggle current password visibility"
                      >
                        {showCurrent ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      New Password
                    </label>

                    <div className="relative mt-2">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-[#DCE9DD] bg-white px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#174B35]"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        aria-label="Toggle new password visibility"
                      >
                        {showNew ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Minimum 8 characters.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Confirm New Password
                    </label>

                    <div className="relative mt-2">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-[#DCE9DD] bg-white px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#174B35]"
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B35] px-6 py-3.5 font-semibold text-white transition hover:bg-[#226344] disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
                  >
                    {changingPassword ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LockKeyhole size={18} />
                    )}

                    {changingPassword
                      ? "Updating Password..."
                      : "Change Password"}
                  </button>
                </div>
              </div>
            </section>

          </div>
        </section>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Thank you for being a part of the Kindora community.
        </p>

      </div>
    </main>
  );
}
