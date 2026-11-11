
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Loader2,
  RefreshCw,
  Users,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
  joinedAt?: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=900&q=85";

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

export default function JoinedEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJoinedEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Get JWT token from Better Auth
      const { data, error: tokenError } =
        await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error(
          tokenError?.message || "Please log in to view your joined events."
        );
      }

      // Fetch joined events with JWT
      const response = await fetch(
        `${API_URL}/api/events/joined`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not load joined events."
        );
      }

      setEvents(result.data || []);
    } catch (err) {
      console.error("Joined events error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJoinedEvents();
  }, [fetchJoinedEvents]);

  return (
    <main className="min-h-screen bg-[#F4F0E8] text-[#172A3A]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#172A3A] px-5 py-16 text-[#F4F0E8] sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#D5F36A]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D5F36A]/30 bg-[#D5F36A]/10 px-4 py-2 text-sm font-medium text-[#D5F36A]">
            <Sparkles size={15} />
            Your volunteering journey
          </div>

          <h1 className="text-4xl font-black sm:text-6xl">
            Joined Events
            <span className="text-[#D5F36A]">.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">
            All the events you have joined, in one place.
            Keep track of your participation and make an impact.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <Users className="text-[#D5F36A]" size={24} />
            <div>
              <p className="text-sm text-white/55">
                Total joined events
              </p>
              <p className="text-2xl font-black text-[#D5F36A]">
                {loading ? "..." : events.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#738344]">
              Your participation
            </p>

            <h2 className="text-3xl font-black sm:text-4xl">
              Your Events
              <span className="text-[#A5BD43]">.</span>
            </h2>

            <p className="mt-3 text-sm text-[#172A3A]/60">
              Events you have successfully joined.
            </p>
          </div>

          <button
            onClick={fetchJoinedEvents}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#172A3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#263e50] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#172A3A]/10 bg-white">
            <Loader2 className="h-10 w-10 animate-spin text-[#738344]" />
            <p className="mt-4 text-sm font-semibold text-[#172A3A]/60">
              Loading your joined events...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center">
            <RefreshCw className="mx-auto text-red-500" size={32} />

            <h3 className="mt-5 text-xl font-bold">
              Unable to load joined events
            </h3>

            <p className="mt-3 text-sm text-[#172A3A]/60">
              {error}
            </p>

            <button
              onClick={fetchJoinedEvents}
              className="mt-6 rounded-full bg-[#172A3A] px-6 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event._id}
                className="group overflow-hidden rounded-3xl border border-[#172A3A]/8 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
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

                  <span className="absolute left-4 top-4 rounded-full bg-[#172A3A]/90 px-3 py-2 text-xs font-bold text-[#D5F36A]">
                    {event.type}
                  </span>

                  <span className="absolute bottom-4 right-4 rounded-full bg-[#D5F36A] px-4 py-2 text-xs font-black text-[#172A3A]">
                    Joined
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[#172A3A]/50">
                    <CalendarDays size={15} className="text-[#829746]" />
                    {formatDate(event.eventDate)}
                  </div>

                  <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-extrabold leading-7">
                    {event.title}
                  </h3>

                  <p className="mt-3 flex items-center gap-2 text-sm text-[#172A3A]/55">
                    <MapPin size={16} className="shrink-0 text-[#829746]" />
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
                      <ArrowUpRight size={19} className="text-[#D5F36A]" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-3xl border border-[#172A3A]/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F0E8] text-[#738344]">
              <CalendarDays size={30} />
            </div>

            <h3 className="mt-5 text-2xl font-black">
              No joined events yet
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#172A3A]/55">
              You haven't joined any events yet. Explore upcoming events
              and become part of your community.
            </p>

            <Link
              href="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#172A3A] px-6 py-3 font-bold text-white transition hover:bg-[#263e50]"
            >
              Explore Events
              <ArrowUpRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
