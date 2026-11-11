
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Tag,
  Users,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
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
  creatorEmail?: string;
  creatorId?: string;
}

// Main event details component
function EventDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { data: session, isPending } = authClient.useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Fetch event details
  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Event not found.");
      }

      setEvent(result.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load event."
      );
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Check whether current user has already joined
  const checkJoinedStatus = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await authClient.token();

      if (error || !data?.token) return;

      const response = await fetch(
        `${API_URL}/api/events/joined`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) return;

      const joined = (result.data || []).some(
        (item: Event) => item._id === eventId
      );

      setHasJoined(joined);
    } catch (error) {
      console.error("Failed to check joined status:", error);
    }
  }, [eventId, session]);

  // Fetch event when page loads
  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  // Check joined status
  useEffect(() => {
    if (!isPending && session?.user) {
      checkJoinedStatus();
    }
  }, [isPending, session, checkJoinedStatus]);

  // Join event
  const handleJoinEvent = async () => {
    if (!session?.user) {
      toast.error("Please login to join this event.");
      router.push("/login");
      return;
    }

    if (hasJoined) {
      toast.error("You have already joined this event.");
      return;
    }

    try {
      setJoining(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        toast.error("Your session has expired. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/events/${eventId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to join event.");
      }

      setHasJoined(true);
      toast.success("You have successfully joined this event!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setJoining(false);
    }
  };

  // Loading state
  if (loading || isPending) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F1]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#174B35]" />
          <p className="mt-4 font-medium text-[#174B35]">
            Loading event details...
          </p>
        </div>
      </main>
    );
  }

  // Event not found
  if (!event) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F1] px-5">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <ImageIcon className="mx-auto h-12 w-12 text-[#E99A62]" />

          <h1 className="mt-4 text-2xl font-bold text-[#174B35]">
            Event Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            This event may have been removed or the link is incorrect.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174B35] px-6 py-3 font-semibold text-white transition hover:bg-[#103b29]"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(event.eventDate).toLocaleDateString(
    "en-BD",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const eventHasPassed =
    new Date(event.eventDate).getTime() <= Date.now();

  return (
    <main className="min-h-screen bg-[#FFF9F1] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back button */}
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-[#174B35] transition hover:text-[#E99A62]"
        >
          <ArrowLeft size={19} />
          Back to Home
        </Link>

        {/* Event content */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_45px_rgba(23,75,53,0.08)]">

          {/* Event image */}
          <div className="relative h-64 w-full bg-[#DCE9DD] sm:h-80 lg:h-[430px]">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-20 w-20 text-[#174B35]/40" />
              </div>
            )}

            <span className="absolute left-5 top-5 rounded-full bg-[#174B35] px-4 py-2 text-sm font-semibold text-white shadow-md">
              {event.type}
            </span>
          </div>

          <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_320px] lg:p-12">

            {/* Main information */}
            <section>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#E99A62]">
                Kindora Community Event
              </p>

              <h1 className="text-3xl font-extrabold leading-tight text-[#174B35] sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <div className="mt-7 flex flex-col gap-4 border-b border-[#DCE9DD] pb-7 text-[#52645A] sm:flex-row sm:flex-wrap">

                <div className="flex items-center gap-2">
                  <CalendarDays className="text-[#E99A62]" size={20} />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="text-[#E99A62]" size={20} />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="text-[#E99A62]" size={20} />
                  <span>{event.type}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#174B35]">
                  About This Event
                </h2>

                <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#52645A]">
                  {event.description}
                </p>
              </div>

              {/* Community message */}
              <div className="mt-9 rounded-2xl bg-[#F4E7D8] p-5">
                <div className="flex items-start gap-3">
                  <Users className="mt-1 shrink-0 text-[#174B35]" size={24} />

                  <div>
                    <h3 className="font-bold text-[#174B35]">
                      Be Part of Something Meaningful
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#52645A]">
                      Join this community event and contribute to positive
                      social development.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Join card */}
            <aside>
              <div className="rounded-2xl border border-[#DCE9DD] bg-[#FFF9F1] p-6 lg:sticky lg:top-24">

                <h2 className="text-xl font-bold text-[#174B35]">
                  Event Information
                </h2>

                <div className="mt-6 space-y-5">

                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="mt-1 font-semibold text-[#26382D]">
                      {formattedDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="mt-1 font-semibold text-[#26382D]">
                      {event.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="mt-1 font-semibold text-[#26382D]">
                      {event.type}
                    </p>
                  </div>
                </div>

                {/* Join button */}
                <div className="mt-7">
                  {eventHasPassed ? (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-300 px-5 py-4 font-bold text-gray-600"
                    >
                      Event Has Ended
                    </button>
                  ) : hasJoined ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DCE9DD] px-5 py-4 font-bold text-[#174B35]"
                    >
                      <CheckCircle2 size={20} />
                      Already Joined
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinEvent}
                      disabled={joining}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B35] px-5 py-4 font-bold text-white shadow-md transition hover:bg-[#103b29] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {joining ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Joining...
                        </>
                      ) : (
                        "Join This Event"
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                  Your participation can make a positive difference.
                </p>

                {session?.user && (
                  <Link
                    href="/joined-events"
                    className="mt-5 block text-center text-sm font-semibold text-[#174B35] underline underline-offset-4 hover:text-[#E99A62]"
                  >
                    View My Joined Events
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

// Loading fallback for Suspense
function EventDetailsLoading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F1]">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#174B35]" />
        <p className="mt-4 font-medium text-[#174B35]">
          Loading event details...
        </p>
      </div>
    </main>
  );
}

// Page component with Suspense boundary
export default function EventDetailsPage() {
  return (
    <Suspense fallback={<EventDetailsLoading />}>
      <EventDetailsContent />
    </Suspense>
  );
}
