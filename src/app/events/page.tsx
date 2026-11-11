
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Filter,
  Globe2,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Leaf,
  Lightbulb,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  image?: string;
  location: string;
  eventDate: string;
  creatorEmail?: string;
  createdAt?: string;
}

const categories = [
  { name: "All", icon: Globe2 },
  { name: "Community Service", icon: Users },
  { name: "Education", icon: GraduationCap },
  { name: "Environment", icon: Leaf },
  { name: "Health", icon: HeartPulse },
  { name: "Social Awareness", icon: Sparkles },
  { name: "Fundraising", icon: HandHeart },
  { name: "Other", icon: Lightbulb },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=900&q=85";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "2-digit",
    timeZone: "Asia/Dhaka",
  });
}

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    month: "short",
    timeZone: "Asia/Dhaka",
  });
}

function isValidDate(date: string) {
  return !Number.isNaN(new Date(date).getTime());
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("earliest");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/events`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load upcoming events."
        );
      }

      const currentTime = Date.now();

      const upcomingEvents: Event[] = (result.data || [])
        .filter(
          (event: Event) =>
            event._id &&
            event.title &&
            isValidDate(event.eventDate) &&
            new Date(event.eventDate).getTime() > currentTime
        )
        .sort(
          (a: Event, b: Event) =>
            new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime()
        );

      setEvents(upcomingEvents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (activeCategory !== "All") {
      filtered = filtered.filter(
        (event) =>
          event.type.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    if (sortOrder === "latest") {
      filtered.reverse();
    }

    return filtered;
  }, [events, activeCategory, search, sortOrder]);

  return (
    <main className="min-h-screen bg-[#F4F0E8] text-[#172A3A]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#172A3A] px-5 pb-20 pt-16 text-[#F4F0E8] sm:px-8 sm:pt-20 lg:px-12">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#D5F36A]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#D5F36A]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D5F36A]/30 bg-[#D5F36A]/10 px-4 py-2 text-sm font-medium text-[#D5F36A]">
            <Sparkles size={15} />
            Discover opportunities to make a difference
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[1fr_350px]">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#D5F36A]">
                Explore Kindora
              </p>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
                Find an event.
                <br />
                <span className="text-[#D5F36A]">
                  Create an impact.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                Discover meaningful community events, connect with
                passionate people, and become part of positive change.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#all-events"
                  className="inline-flex items-center gap-2 rounded-full bg-[#D5F36A] px-6 py-3.5 font-bold text-[#172A3A] transition hover:bg-[#e4ff8a]"
                >
                  Explore Events
                  <ArrowRight size={18} />
                </a>

                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:border-[#D5F36A] hover:text-[#D5F36A]"
                >
                  Create an Event
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>

            <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm lg:block">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D5F36A] text-[#172A3A]">
                <Users size={24} />
              </div>

              <p className="text-sm font-medium text-white/55">
                Upcoming opportunities
              </p>

              <p className="mt-2 text-5xl font-black text-[#D5F36A]">
                {loading ? "..." : events.length}
              </p>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Events waiting for people like you to make a difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section
        id="all-events"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20"
      >
        {/* Section Heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#738344]">
              Make your next move meaningful
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Upcoming Events<span className="text-[#A5BD43]">.</span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#172A3A]/60 sm:text-base">
              Find the right opportunity and join a community that cares.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#172A3A]/60">
            <CalendarDays size={17} />
            <span>{events.length} upcoming events</span>
          </div>
        </div>

        {/* Search and Sorting */}
        <div className="mb-7 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#172A3A]/40"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, locations or categories..."
              className="w-full rounded-2xl border border-[#172A3A]/10 bg-white py-4 pl-12 pr-11 text-sm text-[#172A3A] outline-none transition placeholder:text-[#172A3A]/35 focus:border-[#A5BD43] focus:ring-2 focus:ring-[#D5F36A]/30"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#172A3A]/40 hover:text-[#172A3A]"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#172A3A]/50"
            />

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-[#172A3A]/10 bg-white py-4 pl-11 pr-11 text-sm font-semibold text-[#172A3A] outline-none focus:border-[#A5BD43] sm:w-auto"
            >
              <option value="earliest">Earliest first</option>
              <option value="latest">Latest first</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#172A3A]/50"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#172A3A]/45">
            <Filter size={14} />
            Filter by category
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#172A3A] text-[#D5F36A] shadow-md"
                      : "border border-[#172A3A]/10 bg-white text-[#172A3A]/65 hover:border-[#A5BD43] hover:text-[#172A3A]"
                  }`}
                >
                  <Icon size={15} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#172A3A]/10 bg-white">
            <Loader2 className="h-10 w-10 animate-spin text-[#738344]" />

            <p className="mt-4 text-sm font-semibold text-[#172A3A]/60">
              Discovering upcoming events...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <RefreshCw size={25} />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Unable to load events
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#172A3A]/55">
              {error}
            </p>

            <button
              onClick={fetchEvents}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#172A3A] px-6 py-3 font-semibold text-white transition hover:bg-[#263e50]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-[#172A3A]/55">
                Showing{" "}
                <span className="font-bold text-[#172A3A]">
                  {filteredEvents.length}
                </span>{" "}
                events
              </p>

              {(search || activeCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                  className="text-sm font-bold text-[#738344] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <article
                  key={event._id}
                  className="group overflow-hidden rounded-3xl border border-[#172A3A]/8 bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(23,42,58,0.12)]"
                >
                  {/* Thumbnail */}
                  <div className="relative h-56 overflow-hidden bg-[#E6E9DD]">
                    <img
                      src={event.image || fallbackImage}
                      alt={event.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                      }}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-[#172A3A]/90 px-3.5 py-2 text-xs font-bold text-[#D5F36A] backdrop-blur-sm">
                      {event.type}
                    </span>

                    <div className="absolute bottom-4 right-4 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-[#D5F36A] text-[#172A3A] shadow-lg">
                      <span className="text-xl font-black leading-none">
                        {formatDay(event.eventDate)}
                      </span>
                      <span className="mt-1 text-[10px] font-bold uppercase">
                        {formatMonth(event.eventDate)}
                      </span>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[#172A3A]/50">
                      <CalendarDays size={15} className="text-[#829746]" />
                      {formatDate(event.eventDate)}
                    </div>

                    <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-extrabold leading-7 text-[#172A3A] transition group-hover:text-[#71863D]">
                      {event.title}
                    </h3>

                    <p className="mt-3 flex items-center gap-2 text-sm text-[#172A3A]/55">
                      <MapPin
                        size={16}
                        className="shrink-0 text-[#829746]"
                      />
                      <span className="truncate">{event.location}</span>
                    </p>

                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-6 text-[#172A3A]/55">
                      {event.description}
                    </p>

                    <div className="mt-6 border-t border-[#172A3A]/8 pt-5">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex w-full items-center justify-between rounded-xl bg-[#172A3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#263e50]"
                      >
                        View Event
                        <ArrowUpRight
                          size={19}
                          className="text-[#D5F36A] transition group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="rounded-3xl border border-[#172A3A]/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F0E8] text-[#738344]">
              <CalendarDays size={30} />
            </div>

            <h3 className="mt-5 text-2xl font-black">
              No events found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#172A3A]/55">
              {events.length === 0
                ? "There are no upcoming events at the moment. Check back later or create a new event."
                : "No events match your search or selected category. Try changing your filters."}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="rounded-full border border-[#172A3A]/15 px-5 py-3 text-sm font-bold transition hover:bg-[#F4F0E8]"
              >
                Reset Filters
              </button>

              <Link
                href="/create-event"
                className="rounded-full bg-[#172A3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#263e50]"
              >
                Create an Event
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="px-5 pb-16 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#D5F36A] px-7 py-12 sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-[#172A3A]/5" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#172A3A]/55">
                Your community needs you
              </p>

              <h2 className="max-w-2xl text-3xl font-black leading-tight text-[#172A3A] sm:text-4xl">
                Have an idea that can change something?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#172A3A]/65 sm:text-base">
                Create an event, bring people together, and turn your
                idea into meaningful action.
              </p>
            </div>

            <Link
              href="/create-event"
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#172A3A] px-7 py-4 font-bold text-white transition hover:bg-[#263e50]"
            >
              Create Your Event
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
