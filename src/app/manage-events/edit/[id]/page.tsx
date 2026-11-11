
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_URL = "http://localhost:5000";

interface EventForm {
  title: string;
  description: string;
  type: string;
  image: string;
  location: string;
  eventDate: string;
}

const initialForm: EventForm = {
  title: "",
  description: "",
  type: "",
  image: "",
  location: "",
  eventDate: "",
};

function EditEventContent() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id as string;
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing event
  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.email) {
      router.replace("/login");
      return;
    }

    const loadEvent = async () => {
      try {
        const { data, error } = await authClient.token();

        if (error || !data?.token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(
          `${API_URL}/api/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load event.");
        }

        const event = result.data;

        // Verify ownership in the frontend for UX.
        // Backend still enforces ownership during update.
        if (
          event.creatorId !== session.user.id &&
          event.creatorEmail !== session.user.email
        ) {
          toast.error("You cannot edit this event.");
          router.replace("/manage-events");
          return;
        }

        const date = new Date(event.eventDate);
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 10);

        setForm({
          title: event.title || "",
          description: event.description || "",
          type: event.type || "",
          image: event.image || "",
          location: event.location || "",
          eventDate: localDate,
        });
      } catch (error) {
        console.error("Load event error:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load event."
        );

        router.replace("/manage-events");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, isPending, session, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Update event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.type ||
      !form.location.trim() ||
      !form.eventDate
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            type: form.type,
            image: form.image.trim(),
            location: form.location.trim(),
            eventDate: form.eventDate,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update event.");
      }

      toast.success("Event updated successfully!");

      router.push("/manage-events");
      router.refresh();
    } catch (error) {
      console.error("Update event error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update event."
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFF9F1]">
        <Loader2
          size={36}
          className="animate-spin text-[#174B35]"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F1] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/manage-events"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#174B35] hover:text-[#E99A62]"
        >
          <ArrowLeft size={18} />
          Back to Manage Events
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#E99A62]">
            Dashboard
          </p>

          <h1 className="text-3xl font-bold text-[#174B35] sm:text-4xl">
            Edit Event
          </h1>

          <p className="mt-2 text-sm text-[#849087]">
            Update your event information below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-[#DCE9DD] bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26382D]">
              Event Title *
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
              className="w-full rounded-xl border border-[#DCE9DD] px-4 py-3 text-sm outline-none transition focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26382D]">
              Event Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe your event..."
              className="w-full resize-y rounded-xl border border-[#DCE9DD] px-4 py-3 text-sm outline-none transition focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26382D]">
              Event Category *
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#DCE9DD] bg-white px-4 py-3 text-sm outline-none focus:border-[#174B35]"
            >
              <option value="">Select category</option>
              <option value="Environment">Environment</option>
              <option value="Education">Education</option>
              <option value="Community">Community</option>
              <option value="Health">Health</option>
              <option value="Social">Social</option>
              <option value="Charity">Charity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]">
              <ImageIcon size={17} />
              Event Image URL
            </label>

            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-[#DCE9DD] px-4 py-3 text-sm outline-none focus:border-[#174B35]"
            />

            {form.image && (
              <img
                src={form.image}
                alt="Event preview"
                className="mt-4 h-48 w-full rounded-xl object-cover"
              />
            )}
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]">
              <MapPin size={17} />
              Event Location *
            </label>

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Enter event location"
              className="w-full rounded-xl border border-[#DCE9DD] px-4 py-3 text-sm outline-none focus:border-[#174B35]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]">
              <CalendarDays size={17} />
              Event Date *
            </label>

            <input
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              required
              min={new Date().toLocaleDateString("en-CA")}
              className="w-full rounded-xl border border-[#DCE9DD] px-4 py-3 text-sm outline-none focus:border-[#174B35]"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 border-t border-[#E9E5DC] pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#174B35] px-6 py-3.5 font-semibold text-white transition hover:bg-[#103D2A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Event
                </>
              )}
            </button>

            <Link
              href="/manage-events"
              className="flex items-center justify-center rounded-xl border border-[#DCE9DD] px-6 py-3.5 text-sm font-semibold text-[#174B35] transition hover:bg-[#DCE9DD]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditEventPage() {
  return (
    <ProtectedRoute>
      <EditEventContent />
    </ProtectedRoute>
  );
}

