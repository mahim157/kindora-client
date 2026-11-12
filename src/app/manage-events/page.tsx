"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  CalendarX,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://kindora-server-mocha.vercel.app";

interface EventItem {
  _id: string;
  title: string;
  description: string;
  type: string;
  image?: string;
  location: string;
  eventDate: string;
  creatorEmail?: string;
}

function ManageEventsContent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Get logged-in user's events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/events/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to load events.");
      }

      setEvents(result.data || []);
    } catch (error) {
      console.error("Fetch events error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load your events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (session?.user?.email) {
      fetchEvents();
    }
  }, [isPending, session?.user?.email, fetchEvents]);

  // Delete event
  const handleDelete = async () => {
    if (!selectedEvent) return;

    const id = selectedEvent._id;

    try {
      setDeletingId(id);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to delete event.");
      }

      setEvents((previous) =>
        previous.filter((event) => event._id !== id)
      );

      setSelectedEvent(null);
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Delete event error:", error);

      toast.error(
        error instanceof Error ? error.message : "Delete failed."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format event date
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFF9F1]">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-[#174B35]"
            size={36}
          />
          <p className="mt-3 text-sm text-[#849087]">
            Loading your events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F1] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#E99A62]">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold text-[#174B35] sm:text-4xl">
              Manage Events
            </h1>

            <p className="mt-2 text-sm text-[#849087]">
              Manage and organize the events you have created.
            </p>
          </div>

          <Link
            href="/create-event"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#174B35] px-6 py-3 font-semibold text-white transition hover:bg-[#103D2A]"
          >
            <Plus size={19} />
            Create New Event
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#DCE9DD] bg-white p-6">
            <p className="text-sm text-[#849087]">
              Total Created Events
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#174B35]">
              {events.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DCE9DD] bg-white p-6">
            <p className="text-sm text-[#849087]">
              Your Account
            </p>

            <h2 className="mt-2 truncate text-lg font-bold text-[#174B35]">
              {session?.user?.name || "User"}
            </h2>
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C8D9CA] bg-white px-6 py-20 text-center">
            <CalendarX
              className="mx-auto text-[#174B35]"
              size={48}
            />

            <h2 className="mt-5 text-xl font-bold text-[#26382D]">
              No Events Found
            </h2>

            <p className="mt-2 text-sm text-[#849087]">
              You have not created any events yet.
            </p>

            <Link
              href="/create-event"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174B35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#103D2A]"
            >
              <Plus size={18} />
              Create Your First Event
            </Link>
          </div>
        ) : (
          /* Event Cards */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event._id}
                className="overflow-hidden rounded-2xl border border-[#E9E5DC] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-[#DCE9DD]">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#174B35]">
                      <CalendarDays size={48} />
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-[#174B35] px-3 py-1 text-xs font-semibold text-white">
                    {event.type}
                  </span>
                </div>

                {/* Event Information */}
                <div className="p-5">
                  <h2 className="line-clamp-1 text-xl font-bold text-[#174B35]">
                    {event.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#849087]">
                    {event.description}
                  </p>

                  <div className="mt-5 space-y-3 text-sm text-[#657268]">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={17}
                        className="shrink-0 text-[#E99A62]"
                      />
                      {formatDate(event.eventDate)}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin
                        size={17}
                        className="shrink-0 text-[#E99A62]"
                      />
                      <span className="line-clamp-1">
                        {event.location}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/manage-events/edit/${event._id}`
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#174B35]/20 py-2.5 text-sm font-semibold text-[#174B35] transition hover:bg-[#DCE9DD]"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => setSelectedEvent(event)}
                      disabled={deletingId === event._id}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={25} />
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                disabled={deletingId !== null}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close confirmation"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#26382D]">
              Delete this event?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#849087]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#174B35]">
                {selectedEvent.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                disabled={deletingId !== null}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ManageEventsPage() {
  return (
    <ProtectedRoute>
      <ManageEventsContent />
    </ProtectedRoute>
  );
}