
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Same categories as Create Event page
const categories = [
  "Community Service",
  "Education",
  "Environment",
  "Health",
  "Social Awareness",
  "Fundraising",
  "Other",
];

interface EventForm {
  title: string;
  description: string;
  type: string;
  image: string;
  location: string;
  eventDate: string;
}

type FormErrors = Partial<Record<keyof EventForm, string>>;

const initialForm: EventForm = {
  title: "",
  description: "",
  type: "",
  image: "",
  location: "",
  eventDate: "",
};

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Field validation
function validateField(
  name: keyof EventForm,
  value: string
): string {
  const trimmed = value.trim();

  switch (name) {
    case "title":
      if (!trimmed) return "Event title is required.";
      if (trimmed.length < 5)
        return "Title must be at least 5 characters.";
      if (trimmed.length > 100)
        return "Title cannot exceed 100 characters.";
      return "";

    case "description":
      if (!trimmed) return "Description is required.";
      if (trimmed.length < 20)
        return "Description must be at least 20 characters.";
      if (trimmed.length > 2000)
        return "Description cannot exceed 2000 characters.";
      return "";

    case "type":
      if (!categories.includes(value))
        return "Please select a valid event category.";
      return "";

    case "image":
      if (!trimmed) return "";

      try {
        const url = new URL(trimmed);

        if (
          !["http:", "https:"].includes(url.protocol) ||
          !url.hostname.includes(".")
        ) {
          return "Please enter a valid HTTP or HTTPS image URL.";
        }

        return "";
      } catch {
        return "Please enter a valid image URL.";
      }

    case "location":
      if (!trimmed) return "Event location is required.";
      if (trimmed.length < 3)
        return "Location must be at least 3 characters.";
      if (trimmed.length > 150)
        return "Location cannot exceed 150 characters.";
      return "";

    case "eventDate":
      if (!value) return "Event date is required.";
      if (value < getTomorrowDate())
        return "Please select a future date.";
      return "";

    default:
      return "";
  }
}

// Validate complete form
function validateForm(form: EventForm): FormErrors {
  const errors: FormErrors = {};

  (Object.keys(form) as (keyof EventForm)[]).forEach((key) => {
    const error = validateField(key, form[key]);

    if (error) {
      errors[key] = error;
    }
  });

  return errors;
}

function EditEventContent() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id as string;
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

        // Verify ownership
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

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const field = name as keyof EventForm;

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (submitted || errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: validateField(field, value),
      }));
    }
  };

  // Update event
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSubmitted(true);

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before updating.");
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

  // Loading state
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
          noValidate
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
              maxLength={100}
              placeholder="Enter event title"
              aria-invalid={!!errors.title}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10 ${
                errors.title ? "border-red-500" : "border-[#DCE9DD]"
              }`}
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title}
              </p>
            )}
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
              rows={5}
              maxLength={2000}
              placeholder="Describe your event..."
              aria-invalid={!!errors.description}
              className={`w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10 ${
                errors.description ? "border-red-500" : "border-[#DCE9DD]"
              }`}
            />

            <div className="mt-1 flex justify-between">
              {errors.description ? (
                <p className="text-sm text-red-600">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-gray-400">
                {form.description.length}/2000
              </span>
            </div>
          </div>

          {/* Event Category */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26382D]">
              Event Category *
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              aria-invalid={!!errors.type}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#174B35] ${
                errors.type ? "border-red-500" : "border-[#DCE9DD]"
              }`}
            >
              <option value="">Select an event category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {errors.type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.type}
              </p>
            )}
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
              aria-invalid={!!errors.image}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#174B35] ${
                errors.image ? "border-red-500" : "border-[#DCE9DD]"
              }`}
            />

            {errors.image && (
              <p className="mt-1 text-sm text-red-600">
                {errors.image}
              </p>
            )}

            {form.image && !errors.image && (
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
              maxLength={150}
              placeholder="Enter event location"
              aria-invalid={!!errors.location}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#174B35] ${
                errors.location ? "border-red-500" : "border-[#DCE9DD]"
              }`}
            />

            {errors.location && (
              <p className="mt-1 text-sm text-red-600">
                {errors.location}
              </p>
            )}
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
              min={getTomorrowDate()}
              aria-invalid={!!errors.eventDate}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#174B35] ${
                errors.eventDate ? "border-red-500" : "border-[#DCE9DD]"
              }`}
            />

            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.eventDate}
              </p>
            )}
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
