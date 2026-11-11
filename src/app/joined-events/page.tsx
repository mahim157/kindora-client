
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Heart,
  Users,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface JoinedEvent {
  _id: string;
  title: string;
  description: string;
  type: string;
  image?: string;
  imageUrl?: string;
  location: string;
  eventDate: string;
  joinedAt?: string;
}

function getJoinedEvents(data: unknown): JoinedEvent[] {
  if (Array.isArray(data)) return data as JoinedEvent[];

  if (data && typeof data === "object") {
    const response = data as {
      data?: unknown;
      events?: unknown;
    };

    if (Array.isArray(response.data)) {
      return response.data as JoinedEvent[];
    }

    if (Array.isArray(response.events)) {
      return response.events as JoinedEvent[];
    }
  }

  return [];
}

export default function JoinedEventsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [events, setEvents] = useState<JoinedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchJoinedEvents = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError("");

      const tokenResult = await authClient.token();
      const token = (
        tokenResult as { data?: { token?: string } }
      )?.data?.token;

      if (!token) {
        throw new Error("Authentication token পাওয়া যায়নি।");
      }

      const response = await fetch(`${API_URL}/api/events/joined`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Joined Events লোড করা যায়নি।"
        );
      }

      setEvents(getJoinedEvents(result));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetchJoinedEvents();
  }, [isPending, session, fetchJoinedEvents]);

  const filteredEvents = events.filter((event) => {
    const keyword = search.toLowerCase();

    return (
      event.title?.toLowerCase().includes(keyword) ||
      event.location?.toLowerCase().includes(keyword) ||
      event.type?.toLowerCase().includes(keyword)
    );
  });

  if (isPending || loading) {
    return (
      <main className="min-h-screen bg-[#F4F0E8] px-5 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-[#172A3A]" />
          <p className="font-medium text-[#172A3A]">
            Loading your joined events...
          </p>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F4F0E8] px-5">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-sm">
          <Heart className="mx-auto mb-5 h-12 w-12 text-[#172A3A]" />
          <h1 className="mb-3 text-2xl font-bold text-[#172A3A]">
            Login Required
          </h1>
          <p className="mb-6 text-gray-500">
            Please login to see the events you have joined.
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-[#172A3A] px-7 py-3 font-semibold text-white transition hover:bg-[#263F55]"
          >
            Login Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F0E8] px-5 py-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <section className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D5F36A] px-4 py-2 text-sm font-bold text-[#172A3A]">
            <Heart size={16} />
            YOUR COMMUNITY JOURNEY
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#172A3A] md:text-5xl">
                Joined Events<span className="text-[#A8C82F]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-base leading-7 text-[#64717A]">
                Every event you join is a step toward making a positive
                difference in your community.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#172A3A] px-6 py-3 font-semibold text-white transition hover:bg-[#263F55]"
            >
              Explore Events <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl bg-[#172A3A] p-6 text-white">
            <div className="rounded-xl bg-[#D5F36A] p-3 text-[#172A3A]">
              <Users size={25} />
            </div>
            <div>
              <p className="text-sm text-white/65">Total Joined Events</p>
              <h2 className="text-3xl font-bold">{events.length}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#172A3A]/10 bg-white p-6">
            <div className="rounded-xl bg-[#D5F36A] p-3 text-[#172A3A]">
              <CalendarDays size={25} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Joined Events</p>
              <h2 className="text-3xl font-bold text-[#172A3A]">
                {events.filter(
                  (event) => new Date(event.eventDate) >= new Date()
                ).length}
              </h2>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-[#172A3A]">
            Your Events
          </h2>

          <div className="relative w-full sm:max-w-sm">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your events..."
              className="w-full rounded-full border border-[#172A3A]/10 bg-white py-3 pl-12 pr-5 text-sm text-[#172A3A] outline-none transition focus:border-[#172A3A]"
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchJoinedEvents}
              className="mt-3 inline-flex items-center gap-2 font-semibold underline"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        {/* Event Cards */}
        {!error && filteredEvents.length > 0 && (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article
                key={event._id}
                className="group overflow-hidden rounded-3xl border border-[#172A3A]/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden bg-[#E7E4DC]">
                  <img
                    src={event.image || event.imageUrl || "/placeholder-event.jpg"}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-[#D5F36A] px-4 py-2 text-xs font-bold text-[#172A3A]">
                    {event.type}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="mb-3 line-clamp-2 text-xl font-bold text-[#172A3A]">
                    {event.title}
                  </h3>

                  <p className="mb-5 line-clamp-2 text-sm leading-6 text-gray-500">
                    {event.description}
                  </p>

                  <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={17} className="shrink-0 text-[#829C23]" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin size={17} className="shrink-0 text-[#829C23]" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${event._id}`}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#172A3A] py-3 font-semibold text-white transition hover:bg-[#D5F36A] hover:text-[#172A3A]"
                  >
                    View Details <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Empty State */}
        {!error && filteredEvents.length === 0 && (
          <section className="rounded-3xl border border-dashed border-[#172A3A]/20 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#D5F36A]/40 text-[#172A3A]">
              {search ? <Search size={34} /> : <Heart size={34} />}
            </div>

            <h3 className="text-2xl font-bold text-[#172A3A]">
              {search ? "No matching events found" : "No joined events yet"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              {search
                ? "Try searching with a different event name, category or location."
                : "You haven't joined any events yet. Explore upcoming events and become part of something meaningful."}
            </p>

            {!search && (
              <Link
                href="/events"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#172A3A] px-7 py-3 font-semibold text-white transition hover:bg-[#D5F36A] hover:text-[#172A3A]"
              >
                Explore Events <ArrowRight size={18} />
              </Link>
            )}
          </section>
        )}

        {/* Footer Note */}
        {events.length > 0 && (
          <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-gray-500">
            <Clock size={16} />
            Your joined events are sorted by event date.
          </p>
        )}
      </div>
    </main>
  );
}
