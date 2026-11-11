
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

type FormErrors = Partial<Record<keyof EventForm, string>>;

const initialForm: EventForm = {
  title: "",
  description: "",
  type: "",
  image: "",
  location: "",
  date: "",
};

function validateForm(form: EventForm): FormErrors {
  const errors: FormErrors = {};

  if (form.title.trim().length < 5) {
    errors.title = "Title must contain at least 5 characters.";
  } else if (form.title.trim().length > 100) {
    errors.title = "Title cannot exceed 100 characters.";
  }

  if (form.description.trim().length < 20) {
    errors.description =
      "Description must contain at least 20 characters.";
  } else if (form.description.trim().length > 2000) {
    errors.description =
      "Description cannot exceed 2000 characters.";
  }

  if (!eventTypes.includes(form.type)) {
    errors.type = "Please select a valid event category.";
  }

  if (form.image.trim()) {
    try {
      const url = new URL(form.image.trim());

      if (
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname.includes(".")
      ) {
        errors.image = "Please enter a valid HTTP or HTTPS image URL.";
      }
    } catch {
      errors.image = "Please enter a valid image URL.";
    }
  }

  if (form.location.trim().length < 3) {
    errors.location =
      "Location must contain at least 3 characters.";
  } else if (form.location.trim().length > 150) {
    errors.location = "Location cannot exceed 150 characters.";
  }

  if (!form.date) {
    errors.date = "Please select an event date.";
  } else {
    const selectedDate = new Date(`${form.date}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate < today
    ) {
      errors.date = "Please select today or a future date.";
    }
  }

  return errors;
}

function CreateEventContent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
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

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);

    const fieldErrors = validateForm(updatedForm);

    setErrors((previous) => ({
      ...previous,
      [name]: fieldErrors[name as keyof EventForm],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.email) {
      toast.error("Please login before creating an event.");
      router.push("/login");
      return;
    }

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        toast.error("Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
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
          eventDate: form.date,
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
      setErrors({});

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

  // Dark-mode-aware input styles
  const inputClass = (field: keyof EventForm) =>
    `w-full rounded-xl border ${
      errors[field]
        ? "border-red-400 bg-red-50/40 dark:border-red-500 dark:bg-red-950/30"
        : "border-[#174B35]/15 bg-[#FFF9F1]/50 dark:border-white/15 dark:bg-[#172A24]"
    } px-4 py-3 text-sm text-[#26382D] outline-none transition placeholder:text-[#26382D]/35 focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10 dark:text-[#F1F5F1] dark:placeholder:text-gray-400 dark:focus:border-[#9CCB85] dark:focus:ring-[#9CCB85]/20`;

  const labelClass =
    "mb-2 flex items-center gap-2 text-sm font-semibold text-[#26382D] dark:text-gray-200";

  const iconClass = "text-[#174B35] dark:text-[#9CCB85]";

  const errorText = (field: keyof EventForm) =>
    errors[field] ? (
      <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-[#FFF9F1] px-4 py-10 transition-colors duration-300 dark:bg-[#101C17] sm:px-6 lg:py-14">
      <div className="mx-auto max-w-4xl">

        {/* Back to Home */}
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#174B35] transition hover:text-[#E99A62] dark:text-[#B8D9A7] dark:hover:text-[#E99A62]"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#DCE9DD] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#174B35] dark:bg-[#294638] dark:text-[#C6E5B8]">
            <PlusCircle size={15} />
            Create an Event
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#174B35] dark:text-[#E6F2E3] sm:text-4xl">
            Make Something{" "}
            <span className="text-[#E99A62]">
              Meaningful.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#26382D]/70 dark:text-gray-300 sm:text-base">
            Bring people together, share your ideas, and create a positive
            impact in your community.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-[#174B35]/10 bg-white p-5 shadow-[0_12px_45px_rgba(23,75,53,0.06)] transition-colors duration-300 dark:border-white/10 dark:bg-[#1A2B23] sm:p-8">

          <div className="mb-7 border-b border-[#174B35]/10 pb-5 dark:border-white/10">
            <h2 className="text-xl font-bold text-[#174B35] dark:text-[#E6F2E3]">
              Event Information
            </h2>
            <p className="mt-1 text-sm text-[#26382D]/60 dark:text-gray-400">
              Fill in the details to publish your event.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Event Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                <FileText size={17} className={iconClass} />
                Event Title <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                maxLength={100}
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Community Clean-up Campaign"
                aria-invalid={!!errors.title}
                className={inputClass("title")}
              />

              {errorText("title")}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Event Description <span className="text-red-500">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={2000}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event, its purpose and what participants can expect..."
                aria-invalid={!!errors.description}
                className={`${inputClass("description")} resize-y`}
              />

              {errorText("description")}

              <p className="mt-1 text-right text-xs text-[#26382D]/45 dark:text-gray-400">
                {form.description.length}/2000
              </p>
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="type" className={labelClass}>
                <Tag size={17} className={iconClass} />
                Event Type <span className="text-red-500">*</span>
              </label>

              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                aria-invalid={!!errors.type}
                className={inputClass("type")}
              >
                <option value="">Select an event category</option>

                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {errorText("type")}
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className={labelClass}>
                <ImagePlus size={17} className={iconClass} />
                Event Image URL
              </label>

              <input
                id="image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/event-image.jpg"
                aria-invalid={!!errors.image}
                className={inputClass("image")}
              />

              {errorText("image")}

              <p className="mt-1 text-xs text-[#26382D]/50 dark:text-gray-400">
                Provide a publicly accessible image URL.
              </p>
            </div>

            {/* Location and Date */}
            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <label htmlFor="location" className={labelClass}>
                  <MapPin size={17} className={iconClass} />
                  Event Location <span className="text-red-500">*</span>
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  maxLength={150}
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  aria-invalid={!!errors.location}
                  className={inputClass("location")}
                />

                {errorText("location")}
              </div>

              <div>
                <label htmlFor="date" className={labelClass}>
                  <CalendarDays size={17} className={iconClass} />
                  Event Date <span className="text-red-500">*</span>
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  min={minDate || undefined}
                  value={form.date}
                  onChange={handleChange}
                  aria-invalid={!!errors.date}
                  className={inputClass("date")}
                />

                {errorText("date")}
              </div>
            </div>

            {/* Creator Info */}
            <div className="rounded-xl bg-[#DCE9DD]/60 p-4 dark:bg-[#294638]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#174B35]/70 dark:text-[#C6E5B8]/80">
                Event Organizer
              </p>

              <p className="mt-1 break-all text-sm font-medium text-[#174B35] dark:text-white">
                {session?.user?.email || "Loading user..."}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#174B35]/10 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setErrors({});
                }}
                disabled={loading}
                className="rounded-xl border border-[#174B35]/20 px-6 py-3 text-sm font-semibold text-[#174B35] transition hover:bg-[#DCE9DD] disabled:opacity-50 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#174B35] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#174B35]/15 transition hover:bg-[#103B29] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#6D985D] dark:text-[#102016] dark:hover:bg-[#85B875]"
              >
                <PlusCircle size={18} />
                {loading ? "Creating Event..." : "Create Event"}
              </button>

            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#26382D]/50 dark:text-gray-400">
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
