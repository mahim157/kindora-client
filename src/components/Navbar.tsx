
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Leaf,
  CalendarDays,
  PlusCircle,
  LayoutDashboard,
  UserRound,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut();

      toast.success("Logged out successfully!");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Upcoming Events", href: "/events" },
  ];

  const privateLinks = [
    {
      label: "Create Event",
      href: "/create-event",
      icon: PlusCircle,
    },
    {
      label: "Manage Events",
      href: "/manage-events",
      icon: LayoutDashboard,
    },
    {
      label: "Joined Events",
      href: "/joined-events",
      icon: CalendarDays,
    },
    {
      label: "My Profile",
      href: "/profile",
      icon: UserRound,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#174B35]/10 bg-[#FFF9F1]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174B35] text-white">
            <Leaf size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#174B35]">
              Kindora<span className="text-[#E99A62]">.</span>
            </h1>
            <p className="hidden text-[10px] font-medium tracking-[2px] text-[#26382D]/60 sm:block">
              TOGETHER WE GROW
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? "text-[#174B35]"
                  : "text-[#26382D]/70 hover:text-[#174B35]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user &&
            privateLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "text-[#174B35]"
                    : "text-[#26382D]/70 hover:text-[#174B35]"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
        </div>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-[#DCE9DD]" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="User profile"
                    className="h-9 w-9 rounded-full border border-[#174B35]/20 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE9DD] text-sm font-bold text-[#174B35]">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <span className="max-w-28 truncate text-sm font-semibold text-[#174B35]">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-xl border border-[#174B35]/20 px-4 py-2 text-sm font-semibold text-[#174B35] transition hover:bg-[#174B35] hover:text-white disabled:opacity-50"
              >
                <LogOut size={16} />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#174B35] transition hover:bg-[#DCE9DD]"
              >
                <LogIn size={16} />
                Login
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-[#174B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103B29]"
              >
                <UserPlus size={16} />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-[#174B35] hover:bg-[#DCE9DD] lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-[#174B35]/10 bg-[#FFF9F1] px-5 py-5 shadow-lg lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                  isActive(link.href)
                    ? "bg-[#DCE9DD] text-[#174B35]"
                    : "text-[#26382D] hover:bg-[#DCE9DD]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!isPending && user && (
              <>
                <div className="my-2 border-t border-[#174B35]/10" />

                {privateLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold ${
                      isActive(link.href)
                        ? "bg-[#DCE9DD] text-[#174B35]"
                        : "text-[#26382D] hover:bg-[#DCE9DD]"
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            <div className="my-2 border-t border-[#174B35]/10" />

            {isPending ? (
              <div className="h-10 animate-pulse rounded-lg bg-[#DCE9DD]" />
            ) : user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="User profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE9DD] font-bold text-[#174B35]">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#174B35]">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-[#26382D]/60">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#174B35]/20 px-4 py-3 text-sm font-semibold text-[#174B35] hover:bg-[#174B35] hover:text-white disabled:opacity-50"
                >
                  <LogOut size={17} />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#174B35]/20 px-4 py-3 text-sm font-semibold text-[#174B35]"
                >
                  <LogIn size={17} />
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#174B35] px-4 py-3 text-sm font-semibold text-white"
                >
                  <UserPlus size={17} />
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
