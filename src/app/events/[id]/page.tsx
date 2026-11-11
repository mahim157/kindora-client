
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
  MessageCircle,
  Send,
  Trash2,
  X,
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

interface Comment {
  _id: string;
  eventId: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

function EventDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { data: session, isPending } = authClient.useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

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
        error instanceof Error ? error.message : "Failed to load event."
      );
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch comments (Public)
  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);

      const response = await fetch(
        `${API_URL}/api/events/${eventId}/comments`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load comments.");
      }

      setComments(result.data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [eventId]);

  // Check joined status
  const checkJoinedStatus = useCallback(async () => {
    if (!session?.user) {
      setHasJoined(false);
      return;
    }

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

  // Load event
  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId, fetchEvent]);

  // Load comments
  useEffect(() => {
    if (eventId) fetchComments();
  }, [eventId, fetchComments]);

  // Check joined status
  useEffect(() => {
    if (!isPending && session?.user) {
      checkJoinedStatus();
    } else if (!isPending && !session?.user) {
      setHasJoined(false);
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
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setJoining(false);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    const trimmedComment = commentText.trim();

    if (!session?.user) {
      toast.error("Please login to comment.");
      router.push("/login");
      return;
    }

    if (!hasJoined) {
      toast.error("Join this event before commenting.");
      return;
    }

    if (!trimmedComment) {
      toast.error("Please write something before submitting.");
      return;
    }

    if (trimmedComment.length > 1000) {
      toast.error("Comment cannot exceed 1000 characters.");
      return;
    }

    try {
      setSubmittingComment(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        toast.error("Your session has expired. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/events/${eventId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({
            text: trimmedComment,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add comment.");
      }

      setCommentText("");
      await fetchComments();

      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add comment."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      setDeletingCommentId(commentId);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        toast.error("Your session has expired. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/events/${eventId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete comment.");
      }

      setComments((previous) =>
        previous.filter((comment) => comment._id !== commentId)
      );

      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Open delete modal
  const openDeleteModal = (commentId: string) => {
    setSelectedCommentId(commentId);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (deletingCommentId) return;

    setShowDeleteModal(false);
    setSelectedCommentId(null);
  };

  // Confirm delete
  const confirmDeleteComment = async () => {
    if (!selectedCommentId || deletingCommentId) return;

    await handleDeleteComment(selectedCommentId);

    setShowDeleteModal(false);
    setSelectedCommentId(null);
  };

  // Loading state
  if (loading || isPending) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F1] dark:bg-[#111C19]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#174B35] dark:text-[#A9D18E]" />
          <p className="mt-4 font-medium text-[#174B35] dark:text-[#E2EDE5]">
            Loading event details...
          </p>
        </div>
      </main>
    );
  }

  // Event not found
  if (!event) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F1] px-5 dark:bg-[#111C19]">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-[#1C2A25]">
          <ImageIcon className="mx-auto h-12 w-12 text-[#E99A62]" />

          <h1 className="mt-4 text-2xl font-bold text-[#174B35] dark:text-[#E4F0E7]">
            Event Not Found
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-300">
            This event may have been removed or the link is incorrect.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174B35] px-6 py-3 font-semibold text-white transition hover:bg-[#103b29] dark:bg-[#376B4F] dark:hover:bg-[#477E5E]"
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

  const currentUserId = session?.user?.id;

  return (
    <main className="min-h-screen bg-[#FFF9F1] px-4 py-10 transition-colors duration-300 dark:bg-[#111C19] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back button */}
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-[#174B35] transition hover:text-[#E99A62] dark:text-[#B8DDAE] dark:hover:text-[#F3B27F]"
        >
          <ArrowLeft size={19} />
          Back to Home
        </Link>

        {/* Event content */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_45px_rgba(23,75,53,0.08)] transition-colors duration-300 dark:bg-[#1B2923] dark:shadow-[0_10px_45px_rgba(0,0,0,0.25)]">

          {/* Event image */}
          <div className="relative h-64 w-full bg-[#DCE9DD] dark:bg-[#293A31] sm:h-80 lg:h-[430px]">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-20 w-20 text-[#174B35]/40 dark:text-[#A9D18E]/50" />
              </div>
            )}

            <span className="absolute left-5 top-5 rounded-full bg-[#174B35] px-4 py-2 text-sm font-semibold text-white shadow-md dark:bg-[#376B4F]">
              {event.type}
            </span>
          </div>

          <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_320px] lg:p-12">

            {/* Main information */}
            <section>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#E99A62] dark:text-[#F3B27F]">
                Kindora Community Event
              </p>

              <h1 className="text-3xl font-extrabold leading-tight text-[#174B35] dark:text-[#E5F0E8] sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <div className="mt-7 flex flex-col gap-4 border-b border-[#DCE9DD] pb-7 text-[#52645A] dark:border-[#3A5145] dark:text-[#CBD8CE] sm:flex-row sm:flex-wrap">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-[#E99A62] dark:text-[#F3B27F]" size={20} />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="text-[#E99A62] dark:text-[#F3B27F]" size={20} />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="text-[#E99A62] dark:text-[#F3B27F]" size={20} />
                  <span>{event.type}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#174B35] dark:text-[#E5F0E8]">
                  About This Event
                </h2>

                <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#52645A] dark:text-[#CFDAD2]">
                  {event.description}
                </p>
              </div>

              {/* Community message */}
              <div className="mt-9 rounded-2xl bg-[#F4E7D8] p-5 dark:bg-[#303A30]">
                <div className="flex items-start gap-3">
                  <Users className="mt-1 shrink-0 text-[#174B35] dark:text-[#B8DDAE]" size={24} />

                  <div>
                    <h3 className="font-bold text-[#174B35] dark:text-[#E5F0E8]">
                      Be Part of Something Meaningful
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#52645A] dark:text-[#CBD8CE]">
                      Join this community event and contribute to positive
                      social development.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Join card */}
            <aside>
              <div className="rounded-2xl border border-[#DCE9DD] bg-[#FFF9F1] p-6 dark:border-[#3A5145] dark:bg-[#24332C] lg:sticky lg:top-24">

                <h2 className="text-xl font-bold text-[#174B35] dark:text-[#E5F0E8]">
                  Event Information
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Event Date
                    </p>
                    <p className="mt-1 font-semibold text-[#26382D] dark:text-[#E0E9E2]">
                      {formattedDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-[#26382D] dark:text-[#E0E9E2]">
                      {event.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="mt-1 font-semibold text-[#26382D] dark:text-[#E0E9E2]">
                      {event.type}
                    </p>
                  </div>
                </div>

                {/* Join button */}
                <div className="mt-7">
                  {eventHasPassed ? (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-300 px-5 py-4 font-bold text-gray-600 dark:bg-[#414B45] dark:text-gray-300"
                    >
                      Event Has Ended
                    </button>
                  ) : hasJoined ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DCE9DD] px-5 py-4 font-bold text-[#174B35] dark:bg-[#304C3B] dark:text-[#C8E6C0]"
                    >
                      <CheckCircle2 size={20} />
                      Already Joined
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinEvent}
                      disabled={joining}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B35] px-5 py-4 font-bold text-white shadow-md transition hover:bg-[#103b29] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#376B4F] dark:hover:bg-[#477E5E]"
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

                <p className="mt-4 text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Your participation can make a positive difference.
                </p>

                {session?.user && (
                  <Link
                    href="/joined-events"
                    className="mt-5 block text-center text-sm font-semibold text-[#174B35] underline underline-offset-4 hover:text-[#E99A62] dark:text-[#B8DDAE] dark:hover:text-[#F3B27F]"
                  >
                    View My Joined Events
                  </Link>
                )}
              </div>
            </aside>
          </div>

          {/* Comments Section */}
          <section className="border-t border-[#DCE9DD] px-6 py-10 dark:border-[#3A5145] sm:px-9 lg:px-12">
            <div className="mx-auto max-w-4xl">

              {/* Comments heading */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCE9DD] text-[#174B35] dark:bg-[#304C3B] dark:text-[#C8E6C0]">
                    <MessageCircle size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-[#174B35] dark:text-[#E5F0E8]">
                      Community Discussion
                    </h2>

                    <p className="mt-1 text-sm text-[#738078] dark:text-[#B7C5BB]">
                      Share your thoughts about this event.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[#DCE9DD] px-4 py-2 text-sm font-bold text-[#174B35] dark:bg-[#304C3B] dark:text-[#C8E6C0]">
                  {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
                </span>
              </div>

              {/* Add comment form */}
              <div className="mt-8">
                {session?.user && hasJoined ? (
                  <div className="rounded-2xl border border-[#DCE9DD] bg-[#FFF9F1] p-5 dark:border-[#3A5145] dark:bg-[#24332C]">
                    <label
                      htmlFor="event-comment"
                      className="mb-3 block font-bold text-[#174B35] dark:text-[#E5F0E8]"
                    >
                      Write a Comment
                    </label>

                    <textarea
                      id="event-comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts with the community..."
                      maxLength={1000}
                      rows={4}
                      className="w-full resize-y rounded-xl border border-[#DCE9DD] bg-white p-4 text-sm text-[#26382D] outline-none transition placeholder:text-gray-400 focus:border-[#174B35] focus:ring-2 focus:ring-[#174B35]/10 dark:border-[#455D4E] dark:bg-[#192720] dark:text-[#E5F0E8] dark:placeholder:text-gray-500 dark:focus:border-[#A9D18E] dark:focus:ring-[#A9D18E]/10"
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {commentText.length}/1000 characters
                      </span>

                      <button
                        onClick={handleAddComment}
                        disabled={submittingComment || !commentText.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174B35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103b29] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#376B4F] dark:hover:bg-[#477E5E]"
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send size={17} />
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : session?.user ? (
                  <div className="rounded-2xl border border-[#DCE9DD] bg-[#FFF9F1] p-5 text-center dark:border-[#3A5145] dark:bg-[#24332C]">
                    <Users className="mx-auto h-8 w-8 text-[#174B35] dark:text-[#B8DDAE]" />

                    <h3 className="mt-3 font-bold text-[#174B35] dark:text-[#E5F0E8]">
                      Join the Event to Comment
                    </h3>

                    <p className="mt-2 text-sm text-[#738078] dark:text-[#B7C5BB]">
                      You need to join this event before sharing your thoughts.
                    </p>

                    {!eventHasPassed && (
                      <button
                        onClick={handleJoinEvent}
                        disabled={joining}
                        className="mt-4 rounded-xl bg-[#174B35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103b29] disabled:opacity-50 dark:bg-[#376B4F] dark:hover:bg-[#477E5E]"
                      >
                        {joining ? "Joining..." : "Join This Event"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#DCE9DD] bg-[#FFF9F1] p-5 text-center dark:border-[#3A5145] dark:bg-[#24332C]">
                    <MessageCircle className="mx-auto h-8 w-8 text-[#174B35] dark:text-[#B8DDAE]" />

                    <h3 className="mt-3 font-bold text-[#174B35] dark:text-[#E5F0E8]">
                      Want to Join the Discussion?
                    </h3>

                    <p className="mt-2 text-sm text-[#738078] dark:text-[#B7C5BB]">
                      Login and join this event to post your comment.
                    </p>

                    <Link
                      href="/login"
                      className="mt-4 inline-flex rounded-xl bg-[#174B35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103b29] dark:bg-[#376B4F] dark:hover:bg-[#477E5E]"
                    >
                      Login to Comment
                    </Link>
                  </div>
                )}
              </div>

              {/* Comments list */}
              <div className="mt-9 space-y-4">
                {commentsLoading ? (
                  <div className="flex items-center justify-center gap-3 py-10 text-[#174B35] dark:text-[#B8DDAE]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm font-medium">
                      Loading comments...
                    </span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#DCE9DD] bg-[#FFF9F1] px-5 py-12 text-center dark:border-[#455D4E] dark:bg-[#24332C]">
                    <MessageCircle className="mx-auto h-10 w-10 text-[#829C37] dark:text-[#A9D18E]" />

                    <h3 className="mt-4 font-bold text-[#174B35] dark:text-[#E5F0E8]">
                      No Comments Yet
                    </h3>

                    <p className="mt-2 text-sm text-[#738078] dark:text-[#B7C5BB]">
                      Be the first to share your thoughts about this event!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <article
                      key={comment._id}
                      className="rounded-2xl border border-[#DCE9DD] bg-white p-5 transition hover:shadow-sm dark:border-[#3A5145] dark:bg-[#24332C] dark:hover:bg-[#293A31]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE9DD] font-bold text-[#174B35] dark:bg-[#304C3B] dark:text-[#C8E6C0]">
                            {(comment.userName || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words font-bold text-[#174B35] dark:text-[#E5F0E8]">
                              {comment.userName || "Community Member"}
                            </h3>

                            <p className="mt-1 text-xs text-[#829087] dark:text-[#AAB9AF]">
                              {new Date(comment.createdAt).toLocaleString(
                                "en-BD",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Delete button */}
                        {currentUserId === comment.userId && (
                          <button
                            onClick={() => openDeleteModal(comment._id)}
                            disabled={deletingCommentId === comment._id}
                            aria-label="Delete your comment"
                            title="Delete your comment"
                            className="flex shrink-0 items-center gap-2 rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-[#52645A] dark:text-[#D0DDD3]">
                        {comment.text}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:border dark:border-[#455D4E] dark:bg-[#1B2923]"
          >
            {/* Close button */}
            <button
              onClick={closeDeleteModal}
              disabled={deletingCommentId !== null}
              aria-label="Close modal"
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-[#304137] dark:hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Delete icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <Trash2 size={28} className="text-red-500 dark:text-red-400" />
            </div>

            {/* Modal content */}
            <div className="mt-5 text-center">
              <h2
                id="delete-modal-title"
                className="text-2xl font-bold text-[#174B35] dark:text-[#E5F0E8]"
              >
                Delete Comment?
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#738078] dark:text-[#C0CEC4]">
                Are you sure you want to delete this comment? This action
                cannot be undone.
              </p>
            </div>

            {/* Modal buttons */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={closeDeleteModal}
                disabled={deletingCommentId !== null}
                className="flex-1 rounded-xl border border-[#DCE9DD] bg-[#FFF9F1] px-4 py-3 font-bold text-[#174B35] transition hover:bg-[#DCE9DD] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#455D4E] dark:bg-[#293A31] dark:text-[#E0E9E2] dark:hover:bg-[#354A3D]"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteComment}
                disabled={deletingCommentId !== null}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingCommentId === selectedCommentId ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Comment
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

// Loading fallback
function EventDetailsLoading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F1] dark:bg-[#111C19]">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#174B35] dark:text-[#A9D18E]" />
        <p className="mt-4 font-medium text-[#174B35] dark:text-[#E2EDE5]">
          Loading event details...
        </p>
      </div>
    </main>
  );
}

// Page component
export default function EventDetailsPage() {
  return (
    <Suspense fallback={<EventDetailsLoading />}>
      <EventDetailsContent />
    </Suspense>
  );
}
