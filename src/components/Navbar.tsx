
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HeartHandshake,
  CalendarDays,
  Plus,
  LayoutDashboard,
  UserRound,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const publicLinks = [
  { name: "Home", href: "/" },
  { name: "Upcoming Events", href: "/events" },
];

const accountLinks = [
  {
    name: "Create Event",
    href: "/create-event",
    icon: Plus,
  },
  {
    name: "Manage Events",
    href: "/manage-events",
    icon: LayoutDashboard,
  },
  {
    name: "My Events",
    href: "/joined-events",
    icon: CalendarDays,
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user;
  const isLoggedIn = Boolean(user);

  const displayName =
    user?.name || user?.email?.split("@")[0] || "My Account";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut();

      setAccountOpen(false);
      setMenuOpen(false);

      toast.success("You have been signed out.");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-[#172A3A]/10 bg-[#F4F0E8]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 md:px-10">

        {/* LOGO */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172A3A] text-[#D5F36A]">
            <HeartHandshake size={22} />
          </span>

          <span className="text-[25px] font-black tracking-tight text-[#172A3A]">
            kindora<span className="text-[#829C37]">.</span>
          </span>
        </Link>

        {/* DESKTOP PUBLIC NAVIGATION */}
        <nav className="hidden items-center gap-8 xl:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-2 text-sm font-bold transition ${
                isActive(link.href)
                  ? "text-[#172A3A]"
                  : "text-[#687680] hover:text-[#172A3A]"
              }`}
            >
              {link.name}

              {isActive(link.href) && (
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[#829C37]" />
              )}
            </Link>
          ))}
        </nav>

        {/* DESKTOP ACCOUNT AREA */}
        <div className="hidden items-center gap-4 xl:flex">
          {isPending ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-[#172A3A]/10" />
          ) : isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((previous) => !previous)}
                aria-expanded={accountOpen}
                aria-label="Open account menu"
                className="flex items-center gap-3 rounded-full border border-[#172A3A]/15 bg-white/60 py-1.5 pl-1.5 pr-3 transition hover:border-[#829C37]"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#172A3A] text-xs font-black text-[#D5F36A]">
                    {initials || "U"}
                  </span>
                )}

                <span className="max-w-[130px] truncate text-sm font-bold text-[#172A3A]">
                  {displayName}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-[#687680] transition ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close account menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setAccountOpen(false)}
                  />

                  <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-64 overflow-hidden rounded-2xl border border-[#172A3A]/10 bg-[#F4F0E8] p-2 shadow-2xl">
                    <div className="border-b border-[#172A3A]/10 px-3 py-3">
                      <p className="truncate text-sm font-black text-[#172A3A]">
                        {displayName}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#73808A]">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      {accountLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setAccountOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                              active
                                ? "bg-[#172A3A] text-white"
                                : "text-[#52616C] hover:bg-[#172A3A]/5 hover:text-[#172A3A]"
                            }`}
                          >
                            <Icon size={17} />
                            {link.name}

                            {active && (
                              <span className="ml-auto h-2 w-2 rounded-full bg-[#D5F36A]" />
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-[#172A3A]/10 pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <LogOut size={17} />
                        {loggingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-bold text-[#172A3A] transition hover:text-[#829C37]"
              >
                <LogIn size={17} />
                Login
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-full bg-[#172A3A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#29465C]"
              >
                Get Started
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#172A3A]/15 text-[#172A3A] transition hover:bg-white xl:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <div className="border-t border-[#172A3A]/10 bg-[#F4F0E8] px-5 pb-6 pt-4 shadow-xl xl:hidden">
          <nav className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isActive(link.href)
                    ? "bg-[#172A3A] text-white"
                    : "text-[#52616C] hover:bg-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="my-4 border-t border-[#172A3A]/10" />

          {isPending ? (
            <div className="h-12 animate-pulse rounded-xl bg-[#172A3A]/10" />
          ) : isLoggedIn ? (
            <>
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/70 p-3">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#172A3A] text-sm font-black text-[#D5F36A]">
                    {initials || "U"}
                  </span>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#172A3A]">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-[#73808A]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#829C37]">
                My Account
              </p>

              <div className="flex flex-col gap-1">
                {accountLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive(link.href)
                          ? "bg-[#172A3A] text-white"
                          : "text-[#52616C] hover:bg-white"
                      }`}
                    >
                      <Icon size={17} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut size={17} />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#172A3A]/20 py-3 text-sm font-bold text-[#172A3A]"
              >
                <LogIn size={16} />
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#172A3A] py-3 text-sm font-bold text-white"
              >
                <UserPlus size={16} />
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
