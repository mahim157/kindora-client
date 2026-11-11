
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  GraduationCap,
  Heart,
  HeartHandshake,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  HeartPulse,
  HandHeart,
  Lightbulb,
  Mail,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

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
}

const categories = [
  { name: "All", icon: Globe2 },
  { name: "Environment", icon: Leaf },
  { name: "Education", icon: GraduationCap },
  { name: "Healthcare", icon: HeartPulse },
  { name: "Community", icon: Users },
  { name: "Social Welfare", icon: HeartHandshake },
  { name: "Other", icon: Lightbulb },
];

const gallery = [
  {
    title: "A greener tomorrow",
    category: "ENVIRONMENT",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=85",
  },
  {
    title: "Learning without limits",
    category: "EDUCATION",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=85",
  },
  {
    title: "Care that connects us",
    category: "COMMUNITY",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=85",
  },
  {
    title: "A little help, a big difference",
    category: "SOCIAL WELFARE",
    image:
      "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=900&q=85",
  },
];

const initiatives = [
  {
    number: "01",
    icon: Leaf,
    title: "Environment",
    description:
      "Protect our planet through clean-up drives, tree planting and awareness.",
  },
  {
    number: "02",
    icon: GraduationCap,
    title: "Education",
    description:
      "Create learning opportunities and help young minds reach their potential.",
  },
  {
    number: "03",
    icon: HeartPulse,
    title: "Healthcare",
    description:
      "Support health awareness, wellbeing and accessible community care.",
  },
  {
    number: "04",
    icon: HandHeart,
    title: "Social Welfare",
    description:
      "Bring people together to support families and individuals in need.",
  },
];

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function formatTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
}

function getImage(event: Event) {
  return (
    event.image ||
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85"
  );
}

export default function HomePage() {
  const { data: session } = authClient.useSession();

  const [events, setEvents] = useState<Event[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const user = session?.user;
  const isLoggedIn = Boolean(user);
  const token = session?.session?.token;

  // Fetch upcoming events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/events/recent`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load events from the server.");
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Invalid server response.");
      }

      const upcomingEvents = result.data
        .filter((event: Event) => {
          const eventTime = new Date(event.eventDate).getTime();
          return Number.isFinite(eventTime) && eventTime > Date.now();
        })
        .slice(0, 6);

      setEvents(upcomingEvents);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch joined events
  useEffect(() => {
    const fetchJoined = async () => {
      if (!isLoggedIn || !token) {
        setJoinedIds([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/events/joined`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) return;

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setJoinedIds(
            result.data.map((event: Event) => event._id)
          );
        }
      } catch (error) {
        console.error("Joined events:", error);
      }
    };

    fetchJoined();
  }, [isLoggedIn, token]);

  // Join event
  const handleJoin = async (eventId: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to join this event.");
      window.location.href = "/login";
      return;
    }

    if (!token) {
      toast.error("Please login again to continue.");
      return;
    }

    if (joinedIds.includes(eventId)) {
      toast.success("You have already joined this event.");
      return;
    }

    try {
      setJoiningId(eventId);

      const response = await fetch(
        `${API_URL}/api/events/${eventId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not join this event.");
      }

      setJoinedIds((previous) => [...previous, eventId]);

      toast.success(result.message || "Successfully joined!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setJoiningId(null);
    }
  };

  // Search and category filtering
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = search.toLowerCase();

      const matchesSearch =
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" ||
        event.type.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [events, search, activeCategory]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F4F0E8] text-[#172A3A]">

      {/* HERO */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-12 md:px-10 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#172A3A]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
              <span className="h-2 w-2 rounded-full bg-[#8AA83B]" />
              A community that cares
            </div>

            <h1 className="max-w-3xl text-[3.4rem] font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-[5.5rem]">
              Good things
              <br />
              happen when
              <br />
              <span className="relative inline-block">
                we show up.
                <span className="absolute -bottom-1 left-0 -z-0 h-3 w-full bg-[#D5F36A]" />
              </span>
            </h1>

            <p className="mt-8 max-w-lg text-base leading-8 text-[#64717A] sm:text-lg">
              A place for people who believe that positive change starts
              locally. Discover events, meet changemakers, and turn good
              intentions into real action.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/events"
                className="group flex items-center gap-3 rounded-full bg-[#172A3A] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#29465C]"
              >
                Explore Events
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                href={isLoggedIn ? "/create-event" : "/register"}
                className="flex items-center gap-2 rounded-full border border-[#172A3A]/20 px-7 py-4 text-sm font-bold transition hover:bg-white"
              >
                {isLoggedIn ? "Create an Event" : "Get Started"}
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-4 border-t border-[#172A3A]/15 pt-7">
              <div className="flex -space-x-3">
                {[
                  "photo-1534528741775-53994a69daeb",
                  "photo-1500648767791-00dcc994a43e",
                  "photo-1531123897727-8f129e1688ce",
                ].map((id) => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?w=100&q=80`}
                    alt="Community member"
                    className="h-10 w-10 rounded-full border-2 border-[#F4F0E8] object-cover"
                  />
                ))}
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  People make the difference
                </p>
                <p className="mt-1 text-xs text-[#73808A]">
                  Find your place in the community
                </p>
              </div>
            </div>
          </div>

          {/* HERO IMAGE COLLAGE */}
          <div className="relative min-h-[470px] sm:min-h-[580px]">
            <div className="absolute right-0 top-0 h-[75%] w-[78%] overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&q=90"
                alt="Community members collaborating"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 left-0 h-[45%] w-[48%] overflow-hidden rounded-[1.5rem] border-[8px] border-[#F4F0E8]">
              <img
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=900&q=90"
                alt="Children learning together"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute bottom-14 right-0 flex items-center gap-3 rounded-2xl bg-[#D5F36A] p-4 shadow-xl sm:right-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#172A3A] text-[#D5F36A]">
                <Heart size={21} />
              </div>

              <div>
                <p className="text-sm font-black">Make it matter.</p>
                <p className="text-xs text-[#46532A]">
                  Start with one action
                </p>
              </div>
            </div>

            <div className="absolute left-[48%] top-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#172A3A] text-[#D5F36A] shadow-xl">
              <Sparkles size={27} />
            </div>
          </div>
        </div>

        {/* IMPACT STEPS */}
        <div className="mt-20 grid grid-cols-2 border-y border-[#172A3A]/15 py-7 md:grid-cols-4">
          {[
            ["01", "Discover opportunities"],
            ["02", "Connect with people"],
            ["03", "Take meaningful action"],
            ["04", "Create lasting impact"],
          ].map(([number, text]) => (
            <div
              key={number}
              className="flex items-center gap-3 px-2 py-3 md:border-r md:border-[#172A3A]/15 md:px-6 last:border-r-0"
            >
              <span className="text-sm font-black text-[#8AA83B]">
                {number}
              </span>
              <span className="text-xs font-bold sm:text-sm">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="bg-[#172A3A] px-5 py-20 text-white md:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#D5F36A]">
                Why Kindora
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Change is a
                <br />
                team sport.
              </h2>

              <p className="mt-6 max-w-sm leading-8 text-white/60">
                We make it easier for people to find meaningful ways to help.
                Because stronger communities are built by people who care.
              </p>

              <Link
                href="/events"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#D5F36A] px-6 py-3.5 text-sm font-bold text-[#172A3A] transition hover:bg-white"
              >
                Explore Opportunities <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Users,
                  title: "Connect",
                  text: "Meet people who share your passion for making a difference.",
                },
                {
                  icon: CalendarDays,
                  title: "Participate",
                  text: "Discover local events and take part in meaningful activities.",
                },
                {
                  icon: HeartHandshake,
                  title: "Collaborate",
                  text: "Bring ideas together and make community projects happen.",
                },
                {
                  icon: ShieldCheck,
                  title: "Contribute",
                  text: "Turn your time and skills into positive social impact.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/15 bg-white/[0.04] p-7 transition hover:border-[#D5F36A]/50 hover:bg-white/[0.08]"
                  >
                    <Icon size={27} className="text-[#D5F36A]" />
                    <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/55">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#829C37]">
                Find your cause
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                What moves you?
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-[#73808A]">
              From environmental action to education, there is a cause for
              everyone.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {initiatives.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  href="/events"
                  key={item.number}
                  className="group border-t-2 border-[#172A3A]/15 bg-white/40 p-6 transition hover:border-[#8AA83B] hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#8AA83B]">
                      {item.number}
                    </span>

                    <Icon
                      size={25}
                      className="text-[#172A3A] transition group-hover:text-[#829C37]"
                    />
                  </div>

                  <h3 className="mt-10 text-xl font-black">{item.title}</h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#73808A]">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                    Explore <ArrowUpRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section
        id="events"
        className="bg-[#E8E4DA] px-5 py-20 md:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#829C37]">
                Make a difference
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Upcoming events<span className="text-[#829C37]">.</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#73808A]">
                Find an opportunity, show up, and be part of something bigger.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#172A3A]/25 px-6 py-3 text-sm font-bold transition hover:bg-[#172A3A] hover:text-white md:self-auto"
            >
              View All Events <ArrowUpRight size={17} />
            </Link>
          </div>

          {/* FILTER BAR */}
          <div className="mt-10 flex flex-col gap-5 border-y border-[#172A3A]/15 py-5">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#73808A]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, places..."
                className="w-full rounded-full border border-[#172A3A]/15 bg-[#F4F0E8] py-3.5 pl-11 pr-5 text-sm outline-none transition focus:border-[#829C37]"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setActiveCategory(category.name)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                      activeCategory === category.name
                        ? "bg-[#172A3A] text-white"
                        : "border border-[#172A3A]/15 text-[#52616C] hover:bg-white"
                    }`}
                  >
                    <Icon size={15} />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EVENT LOADING */}
          {loading ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse bg-[#F4F0E8]">
                  <div className="h-56 bg-[#D9D6CB]" />

                  <div className="space-y-4 p-6">
                    <div className="h-4 w-1/3 bg-[#D9D6CB]" />
                    <div className="h-6 w-3/4 bg-[#D9D6CB]" />
                    <div className="h-4 w-full bg-[#D9D6CB]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-10 bg-[#F4F0E8] px-6 py-16 text-center">
              <h3 className="text-xl font-black">
                Events could not be loaded
              </h3>

              <p className="mt-3 text-sm text-[#73808A]">{error}</p>

              <button
                onClick={fetchEvents}
                className="mt-6 rounded-full bg-[#172A3A] px-6 py-3 text-sm font-bold text-white"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="mt-10 bg-[#F4F0E8] px-6 py-16 text-center">
              <CalendarDays
                size={32}
                className="mx-auto text-[#829C37]"
              />

              <h3 className="mt-5 text-xl font-black">No events found</h3>

              <p className="mt-3 text-sm text-[#73808A]">
                Try a different search or category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 text-sm font-bold underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => {
                const joined = joinedIds.includes(event._id);
                const joining = joiningId === event._id;

                return (
                  <article
                    key={event._id}
                    className="group overflow-hidden bg-[#F4F0E8] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-60 overflow-hidden bg-[#D9D6CB]">
                      <img
                        src={getImage(event)}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <span className="absolute left-4 top-4 bg-[#D5F36A] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#172A3A]">
                        {event.type}
                      </span>

                      <span className="absolute bottom-4 right-4 bg-[#172A3A] px-3 py-2 text-xs font-bold text-white">
                        {String(index + 1).padStart(2, "0")} / 06
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#73808A]">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(event.eventDate)}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {formatTime(event.eventDate)}
                        </span>
                      </div>

                      <h3 className="mt-5 line-clamp-2 min-h-[3.5rem] text-xl font-black leading-snug">
                        {event.title}
                      </h3>

                      <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#73808A]">
                        {event.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2 border-t border-[#172A3A]/10 pt-4 text-xs font-semibold text-[#73808A]">
                        <MapPin size={15} className="text-[#829C37]" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Link
                          href={`/events/${event._id}`}
                          className="flex flex-1 items-center justify-center gap-2 border border-[#172A3A]/20 py-3 text-xs font-black transition hover:bg-[#172A3A] hover:text-white"
                        >
                          View Details <ArrowUpRight size={15} />
                        </Link>

                        <button
                          type="button"
                          disabled={joined || joining}
                          onClick={() => handleJoin(event._id)}
                          className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-black transition ${
                            joined
                              ? "bg-[#D5F36A] text-[#172A3A]"
                              : "bg-[#172A3A] text-white hover:bg-[#29465C] disabled:opacity-60"
                          }`}
                        >
                          {joining ? (
                            "Joining..."
                          ) : joined ? (
                            <>
                              Joined <Check size={15} />
                            </>
                          ) : (
                            <>
                              Join This Event <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="px-5 py-20 md:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#829C37]">
                Real people. Real stories.
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Moments of impact<span className="text-[#829C37]">.</span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-[#73808A]">
              Every small effort has a story. Here are the moments that
              inspire us to keep going.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item, index) => (
              <div
                key={item.title}
                className={`group relative overflow-hidden bg-[#172A3A] ${
                  index % 2 === 0 ? "h-[360px]" : "h-[310px] lg:mt-12"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#101D29]/90 via-transparent to-transparent" />

                <div className="absolute bottom-0 p-6 text-white">
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#D5F36A]">
                    {item.category}
                  </span>

                  <h3 className="mt-3 text-xl font-black">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#D5F36A] px-5 py-20 md:px-10 lg:py-28">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#52602B]">
              Your next step starts here
            </span>

            <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#172A3A] sm:text-6xl">
              Don't just care.
              <br />
              Make it count.
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-[#52602B]">
              Find an event, bring your ideas, and help make your community
              stronger. Your next meaningful moment starts today.
            </p>
          </div>

          <Link
            href={isLoggedIn ? "/create-event" : "/register"}
            className="group flex shrink-0 items-center gap-4 rounded-full bg-[#172A3A] px-8 py-5 text-sm font-black text-white transition hover:bg-[#29465C]"
          >
            {isLoggedIn ? "Create an Event" : "Get Started"}

            <ArrowUpRight
              size={20}
              className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        id="newsletter"
        className="bg-[#172A3A] px-5 py-20 text-white md:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#D5F36A]">
              <span className="h-2 w-2 rounded-full bg-[#D5F36A]" />
              The Kindora Newsletter
            </span>

            <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Stay in the loop.
              <br />
              <span className="text-[#D5F36A]">Stay inspired.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Get the latest community events, inspiring stories, and
              opportunities to make a difference — delivered straight to
              your inbox.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D5F36A] text-[#172A3A]">
                <Mail size={22} />
              </div>

              <div>
                <h3 className="text-lg font-black">
                  A little good in your inbox.
                </h3>
                <p className="mt-1 text-xs text-white/50">
                  Community updates, delivered with purpose.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#D5F36A]"
              />

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full bg-[#D5F36A] px-7 py-4 text-sm font-black text-[#172A3A] transition hover:bg-white"
              >
                Subscribe <ArrowRight size={17} />
              </button>
            </div>

            <p className="mt-4 text-[11px] leading-5 text-white/40">
              Stay connected with the causes and communities that matter
              to you.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#101D29] px-5 pb-8 pt-16 text-white md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D5F36A] text-[#172A3A]">
                <HeartHandshake size={22} />
              </div>

              <span className="text-2xl font-black">
                kindora<span className="text-[#D5F36A]">.</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
              Bringing people together through meaningful community events
              and positive social action.
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-black text-[#D5F36A]">
              Explore
            </h3>

            <div className="flex flex-col gap-4 text-sm text-white/55">
              <Link href="/events" className="hover:text-white">
                All Events
              </Link>

              <Link href="/create-event" className="hover:text-white">
                Create Event
              </Link>

              <Link href="/joined-events" className="hover:text-white">
                My Events
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-black text-[#D5F36A]">
              Community
            </h3>

            <div className="flex flex-col gap-4 text-sm text-white/55">
              <a href="#about" className="hover:text-white">
                About Us
              </a>

              <a href="#gallery" className="hover:text-white">
                Our Stories
              </a>

              <Link href="/manage-events" className="hover:text-white">
                Manage Events
              </Link>

              <a href="#newsletter" className="hover:text-white">
                Newsletter
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-black text-[#D5F36A]">
              Account
            </h3>

            <div className="flex flex-col gap-4 text-sm text-white/55">
              <Link href="/login" className="hover:text-white">
                Login
              </Link>

              <Link href="/register" className="hover:text-white">
                Register
              </Link>

              <Link href="/profile" className="hover:text-white">
                My Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 pt-7 text-xs text-white/40 sm:flex-row">
          <p>© 2026 Kindora. All rights reserved.</p>

          <p className="flex items-center gap-2">
            Made for people who care
            <Heart size={13} className="text-[#D5F36A]" />
          </p>
        </div>
      </footer>
    </main>
  );
}
