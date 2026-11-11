
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  ImagePlus,
  FileText,
  Tag,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const eventTypes = [
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
  date: string;
}

const initialForm: EventForm = {
  title: "",
  description: "",
  type: "",
  image: "",
  location: "",
  date: "",
};

function CreateEventContent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    setMinDate(`${year}-${month}-${day}`);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.email) {
      toast.error("Please login before creating an event.");
      router.push("/login");
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter the event title and description.");
      return;
    }

    if (!form.type || !form.location.trim() || !form.date) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (form.date < minDate) {
      toast.error("Please select today or a future date.");
      return;
    }

    if (form.image.trim()) {
      try {
        const imageUrl = new URL(form.image.trim());

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid image URL");
        }
      } catch {
        toast.error("Please enter a valid image URL.");
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          image: form.image.trim(),
          location: form.location.trim(),
          date: form.date,
          creatorEmail: session.user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to create the event."
        );
      }

      toast.success("Your event has been created successfully!");
      setForm(initialForm);
      router.push("/manage-events");
      router.refresh();
    } catch (error) {
      console.error("Create event error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F1] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-4xl">

        {/* Back Navigation */}
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#174B35] transition hover:text-[#E99A62]"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#DCE9DD] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#174B35]">
            <PlusCircle size={15} />
            Create an Event
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#174B35] sm:text-4xl">
            Make Something <span className="text-[#E99A62]">Meaningful.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#26382D]/70 sm:text-base">
            Bring people together, share your ideas, and create a positive
            impact in your community.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-[#174B35]/10 bg-white p-5 shadow-[0_12px_45px_rgba(23,75,53,0.06)] sm:p-8">

          <div className="mb-7 border-b border-[#174B35]/10 pb-5">
            <h2 className="text-xl font-bold text-[#174B35]">
              Event Information
            </h2>
            <p className="mt-1 text-sm text-[#26382D]/60">
              Fill in the details to publish your event.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Event Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]"
              >
                <FileText size={17} className="text-[#174B35]" />
                Event Title <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={100}
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Community Clean-up Campaign"
                className="w-full rounded-xl border border-[#174B35]/15 bg-[#FFF9F1]/50 px-4 py-3 text-sm text-[#26382D] outline-none transition placeholder:text-[#26382D]/35 focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-[#26382D]"
              >
                Event Description <span className="text-red-500">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                required
                rows={5}
                maxLength={2000}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event, its purpose and what participants can expect..."
                className="w-full resize-y rounded-xl border border-[#174B35]/15 bg-[#FFF9F1]/50 px-4 py-3 text-sm text-[#26382D] outline-none transition placeholder:text-[#26382D]/35 focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
              />

              <p className="mt-1 text-right text-xs text-[#26382D]/45">
                {form.description.length}/2000
              </p>
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="type"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]"
              >
                <Tag size={17} className="text-[#174B35]" />
                Event Type <span className="text-red-500">*</span>
              </label>

              <select
                id="type"
                name="type"
                required
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#174B35]/15 bg-[#FFF9F1]/50 px-4 py-3 text-sm text-[#26382D] outline-none transition focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
              >
                <option value="">Select an event category</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="image"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]"
              >
                <ImagePlus size={17} className="text-[#174B35]" />
                Event Image URL
              </label>

              <input
                id="image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/event-image.jpg"
                className="w-full rounded-xl border border-[#174B35]/15 bg-[#FFF9F1]/50 px-4 py-3 text-sm text-[#26382D] outline-none transition placeholder:text-[#26382D]/35 focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
              />

              <p className="mt-1 text-xs text-[#26382D]/50">
                Provide a publicly accessible image URL.
              </p>
            </div>

            {/* Location and Date */}
            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]"
                >
                  <MapPin size={17} className="text-[#174B35]" />
                  Event Location <span className="text-red-500">*</span>
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  className="w-full rounded-xl border border-[#174B35]/15 bg-[#FFF9F1]/50 px-4 py-3 text-sm text-[#26382D] outline-none transition placeholder:text-[#26382D]/35 focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D]"
                >
                  <CalendarDays size={17} className="text-[#174B35]" />
                  Event Date <span className="text-red-500">*</span>
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  min={minDate || undefined}
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#174B35]/15 bg-[#FFF9F1]/50 px-4 py-3 text-sm text-[#26382D] outline-none transition focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10"
                />
              </div>
            </div>

            {/* Creator Info */}
            <div className="rounded-xl bg-[#DCE9DD]/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#174B35]/70">
                Event Organizer
              </p>
              <p className="mt-1 break-all text-sm font-medium text-[#174B35]">
                {session?.user?.email || "Loading user..."}
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#174B35]/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                disabled={loading}
                className="rounded-xl border border-[#174B35]/20 px-6 py-3 text-sm font-semibold text-[#174B35] transition hover:bg-[#DCE9DD] disabled:opacity-50"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#174B35] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#174B35]/15 transition hover:bg-[#103B29] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlusCircle size={18} />
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#26382D]/50">
          Every event starts with an idea. Let&apos;s make yours meaningful.
        </p>
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  );
}
