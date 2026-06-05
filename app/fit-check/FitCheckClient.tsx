"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MessageSquareText,
  Plus,
  Search,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatRole = "staff" | "assistant";
type ScopeMode = "all" | "manual";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  meta?: string;
}

interface ChatSession {
  id: string;
  title: string;
  scopeMode: ScopeMode;
  selectedUsers: FitCheckUser[];
  updatedAt: string;
  createdAt: string;
  messages: ChatMessage[];
  provider?: string | null;
  model?: string | null;
}

interface FitCheckClientProps {
  staffEmail: string;
}

interface FitCheckUser {
  id: string;
  email: string | null;
  fullName: string | null;
  permissions: string;
  createdAt: string | null;
  lastSignInAt: string | null;
}

const initialSession: ChatSession = {
  id: "session-initial",
  title: "בדיקה חדשה",
  scopeMode: "all",
  selectedUsers: [],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  messages: [
    {
      id: "welcome",
      role: "assistant",
      createdAt: new Date().toISOString(),
      content:
        "אפשר להזין כאן פרטי מאובחן/ת, מקצוע, מסלול לימודים או תרחיש תעסוקתי לבדיקה ראשונית.",
    },
  ],
};

const historySidebarOpenQuery = "(min-width: 1280px)";

export default function FitCheckClient({ staffEmail }: FitCheckClientProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [activeSessionId, setActiveSessionId] = useState(initialSession.id);
  const [prompt, setPrompt] = useState("");
  const [scopeMode, setScopeMode] = useState<ScopeMode>("all");
  const [selectedUsers, setSelectedUsers] = useState<FitCheckUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FitCheckUser[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = useMemo(
    () =>
      sessions.find((session) => session.id === activeSessionId) ??
      sessions[0],
    [activeSessionId, sessions]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(historySidebarOpenQuery);
    const syncHistoryState = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsHistoryOpen(event.matches);
    };

    syncHistoryState(mediaQuery);
    mediaQuery.addEventListener("change", syncHistoryState);

    return () => {
      mediaQuery.removeEventListener("change", syncHistoryState);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSessions = async () => {
      setIsLoadingSessions(true);
      setError(null);

      try {
        const response = await fetch("/api/fit-check/sessions", {
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            payload.error || "לא הצלחנו לטעון את היסטוריית הבדיקות."
          );
        }

        let loadedSessions = normalizeApiSessions(payload.sessions);

        if (loadedSessions.length === 0) {
          const createResponse = await fetch("/api/fit-check/sessions", {
            method: "POST",
            credentials: "include",
          });
          const createPayload = await createResponse.json().catch(() => ({}));

          if (!createResponse.ok) {
            throw new Error(
              createPayload.error || "לא הצלחנו ליצור בדיקת התאמה חדשה."
            );
          }

          loadedSessions = [normalizeApiSession(createPayload.session)];
        }

        if (!isMounted) return;

        setSessions(loadedSessions);
        setActiveSessionId(loadedSessions[0].id);
        setScopeMode(loadedSessions[0].scopeMode);
        setSelectedUsers(loadedSessions[0].selectedUsers);
      } catch (loadError) {
        if (!isMounted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "לא הצלחנו לטעון את היסטוריית הבדיקות."
        );
      } finally {
        if (isMounted) {
          setIsLoadingSessions(false);
        }
      }
    };

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (scopeMode !== "manual") return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearchingUsers(true);

      try {
        const response = await fetch(
          `/api/fit-check/users?q=${encodeURIComponent(userSearch.trim())}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "לא הצלחנו לחפש מאובחנים.");
        }

        setSearchResults(payload.users ?? []);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setError(
          searchError instanceof Error
            ? searchError.message
            : "לא הצלחנו לחפש מאובחנים."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingUsers(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [scopeMode, userSearch]);

  const handleNewSession = async () => {
    if (isCreatingSession) return;

    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await fetch("/api/fit-check/sessions", {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "לא הצלחנו ליצור בדיקה חדשה.");
      }

      const session = normalizeApiSession(payload.session);
      setSessions((currentSessions) => [session, ...currentSessions]);
      selectSession(session);
      setPrompt("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "לא הצלחנו ליצור בדיקה חדשה."
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSending) return;
    if (scopeMode === "manual" && selectedUsers.length === 0) {
      setError("יש לבחור לפחות מאובחן אחד עבור בחירה ידנית.");
      return;
    }

    const now = new Date().toISOString();
    const staffMessage: ChatMessage = {
      id: `staff-${Date.now()}`,
      role: "staff",
      createdAt: now,
      content: trimmedPrompt,
    };
    const pendingMessageId = `assistant-${Date.now() + 1}`;
    const pendingMessage: ChatMessage = {
      id: pendingMessageId,
      role: "assistant",
      createdAt: now,
      content: "בודק את הנתונים...",
    };
    const messagesForApi = activeSession.messages
      .filter((message) => message.id !== "welcome")
      .map(({ id, role, content, createdAt, meta }) => ({
        id,
        role,
        content,
        createdAt,
        meta,
      }));
    const nextTitle =
      activeSession.title === "בדיקה חדשה" &&
      activeSession.messages.length <= 1
        ? trimmedPrompt.slice(0, 42)
        : activeSession.title;

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== activeSession.id) return session;

        return {
          ...session,
          title: nextTitle,
          scopeMode,
          selectedUsers,
          updatedAt: now,
          messages: [
            ...session.messages,
            staffMessage,
            pendingMessage,
          ],
        };
      })
    );

    setPrompt("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/fit-check/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedPrompt,
          sessionId: activeSession.id,
          title: nextTitle,
          messages: [...messagesForApi, staffMessage],
          scope: {
            mode: scopeMode,
            userIds: selectedUsers.map((user) => user.id),
            selectedUsers,
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "לא הצלחנו להשלים את בדיקת ההתאמה.");
      }

      if (payload.session) {
        const savedSession = normalizeApiSession(payload.session);
        setSessions((currentSessions) =>
          [savedSession, ...currentSessions.filter((session) => session.id !== savedSession.id)]
        );
        setActiveSessionId(savedSession.id);
      } else {
        replaceAssistantMessage(pendingMessageId, {
          content: payload.answer ?? "לא התקבלה תשובה.",
          meta:
            payload.provider && payload.model
              ? `${payload.provider} / ${payload.model}`
              : undefined,
        });
      }
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "לא הצלחנו להשלים את בדיקת ההתאמה.";
      setError(message);
      replaceAssistantMessage(pendingMessageId, {
        content: message,
        meta: "שגיאה",
      });
    } finally {
      setIsSending(false);
    }
  };

  const replaceAssistantMessage = (
    messageId: string,
    update: Pick<ChatMessage, "content"> & Partial<Pick<ChatMessage, "meta">>
  ) => {
    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              updatedAt: new Date().toISOString(),
              messages: session.messages.map((message) =>
                message.id === messageId ? { ...message, ...update } : message
              ),
            }
          : session
      )
    );
  };

  const addSelectedUser = (user: FitCheckUser) => {
    setSelectedUsers((currentUsers) =>
      currentUsers.some((currentUser) => currentUser.id === user.id)
        ? currentUsers
        : [...currentUsers, user]
    );
    setUserSearch("");
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId)
    );
  };

  const selectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setScopeMode(session.scopeMode);
    setSelectedUsers(session.selectedUsers);
    setPrompt("");
    setError(null);
  };

  return (
    <div className="dashboard-glass-page min-h-screen px-4 py-8 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 text-white">
        <header className="dashboard-glass-panel rounded-lg px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <Sparkles className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal">
                  בדיקת התאמה
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  ממשק צוות לשיחה, בדיקה והשוואת אפשרויות התאמה.
                </p>
              </div>
            </div>

            {staffEmail ? (
              <div className="rounded-lg border border-white/16 bg-white/8 px-3 py-2 text-xs text-white/65" dir="ltr">
                {staffEmail}
              </div>
            ) : null}
          </div>

          <div className="mt-5 border-t border-white/12 pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white/78">
                  <UsersRound className="size-4" />
                  טווח הנתונים ל־AI
                </div>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  בחירה ידנית מצמצמת את הקונטקסט למאובחנים ספציפיים.
                </p>
              </div>

              <div className="inline-grid grid-cols-2 overflow-hidden rounded-lg border border-white/20 bg-slate-950/24 p-1">
                <button
                  type="button"
                  className={`rounded-md px-4 py-2 text-sm transition ${
                    scopeMode === "all"
                      ? "bg-white text-slate-950"
                      : "text-white/72 hover:bg-white/10"
                  }`}
                  onClick={() => setScopeMode("all")}
                >
                  כל המאובחנים
                </button>
                <button
                  type="button"
                  className={`rounded-md px-4 py-2 text-sm transition ${
                    scopeMode === "manual"
                      ? "bg-white text-slate-950"
                      : "text-white/72 hover:bg-white/10"
                  }`}
                  onClick={() => setScopeMode("manual")}
                >
                  בחירה ידנית
                </button>
              </div>
            </div>

            {scopeMode === "manual" ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/55" />
                  <Input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="חיפוש לפי שם או אימייל"
                    className="h-11 border-white/25 bg-slate-950/35 pr-10 text-white placeholder:text-white/45 focus-visible:ring-white/35"
                  />
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-white/18 bg-slate-950/95 shadow-2xl shadow-blue-950/30">
                    {isSearchingUsers ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-sm text-white/65">
                        <Loader2 className="size-4 animate-spin" />
                        מחפש...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-white/55">
                        לא נמצאו מאובחנים.
                      </div>
                    ) : (
                      searchResults.map((user) => {
                        const isSelected = selectedUsers.some(
                          (selectedUser) => selectedUser.id === user.id
                        );

                        return (
                          <button
                            key={user.id}
                            type="button"
                            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-right text-sm text-white transition hover:bg-white/10 disabled:opacity-45"
                            disabled={isSelected}
                            onClick={() => addSelectedUser(user)}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium" dir="ltr">
                                {user.email || "ללא אימייל"}
                              </span>
                              {user.fullName ? (
                                <span className="block truncate text-xs text-white/52">
                                  {user.fullName}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-xs text-white/45">
                              {isSelected ? "נבחר" : "הוספה"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/16 bg-white/7 p-3">
                  <div className="text-xs font-semibold text-white/60">
                    נבחרו {selectedUsers.length}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedUsers.length === 0 ? (
                      <span className="text-sm text-white/48">
                        עדיין לא נבחרו מאובחנים.
                      </span>
                    ) : (
                      selectedUsers.map((user) => (
                        <span
                          key={user.id}
                          className="inline-flex max-w-full items-center gap-2 rounded-md border border-white/18 bg-white/10 px-2.5 py-1.5 text-xs text-white"
                        >
                          <span className="truncate" dir="ltr">
                            {user.email || user.fullName || user.id}
                          </span>
                          <button
                            type="button"
                            aria-label="הסרת מאובחן"
                            onClick={() => removeSelectedUser(user.id)}
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        {error ? (
          <div className="dashboard-glass-panel flex items-center gap-3 rounded-lg border-red-200/30 bg-red-950/30 px-5 py-4 text-sm text-red-50">
            <AlertTriangle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <section
          className={`grid min-h-[680px] overflow-hidden rounded-lg border border-white/18 bg-slate-950/28 backdrop-blur ${
            isHistoryOpen
              ? "lg:grid-cols-[280px_minmax(0,1fr)]"
              : "lg:grid-cols-[56px_minmax(0,1fr)]"
          }`}
        >
          <aside className="flex min-h-[220px] flex-col border-b border-white/12 bg-slate-950/26 lg:border-b-0 lg:border-l">
            <div
              className={`border-b border-white/12 ${
                isHistoryOpen ? "p-3" : "p-2"
              }`}
            >
              <button
                type="button"
                className={`flex items-center rounded-md border border-white/16 bg-white/6 text-sm text-white/75 transition hover:bg-white/10 ${
                  isHistoryOpen
                    ? "h-10 w-full justify-between px-3"
                    : "size-10 justify-center p-0"
                }`}
                aria-expanded={isHistoryOpen}
                aria-label={isHistoryOpen ? "סגירת היסטוריה" : "פתיחת היסטוריה"}
                onClick={() => setIsHistoryOpen((open) => !open)}
              >
                {isHistoryOpen ? (
                  <>
                    <span className="flex items-center gap-2">
                      <Clock3 className="size-4" />
                      היסטוריה
                    </span>
                    <ChevronRight className="size-4" />
                  </>
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </button>
            </div>

            <div
              className={`border-b border-white/12 ${
                isHistoryOpen ? "p-4" : "p-2"
              }`}
            >
              <Button
                type="button"
                variant="outline"
                className={`w-full border-white/25 bg-white/10 text-white hover:bg-white/15 ${
                  isHistoryOpen ? "" : "size-10 min-w-0 px-0 py-0"
                }`}
                onClick={handleNewSession}
                disabled={isCreatingSession}
                title="בדיקה חדשה"
              >
                {isCreatingSession ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {isHistoryOpen ? (isCreatingSession ? "יוצר..." : "בדיקה חדשה") : null}
              </Button>
            </div>

            <div
              className={`min-h-0 flex-1 overflow-y-auto ${
                isHistoryOpen ? "p-3" : "p-2"
              }`}
            >
              {isLoadingSessions ? (
                <div
                  className={`flex items-center gap-2 px-2 py-3 text-sm text-white/60 ${
                    isHistoryOpen ? "" : "justify-center"
                  }`}
                >
                  <Loader2 className="size-4 animate-spin" />
                  {isHistoryOpen ? "טוען היסטוריה..." : null}
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                  const isActive = session.id === activeSession.id;

                  return (
                    <button
                      key={session.id}
                      type="button"
                      className={`w-full rounded-md border text-sm transition ${
                        isActive
                          ? "border-cyan-300/45 bg-cyan-400/14 text-white"
                          : "border-white/10 bg-white/5 text-white/72 hover:bg-white/9"
                      } ${isHistoryOpen ? "px-3 py-3 text-right" : "flex h-10 items-center justify-center px-0 py-0"}`}
                      onClick={() => selectSession(session)}
                      title={session.title}
                    >
                      <span
                        className={`flex items-center gap-2 ${
                          isHistoryOpen ? "" : "justify-center"
                        }`}
                      >
                        {isHistoryOpen ? (
                          <MessageSquareText className="size-4 shrink-0" />
                        ) : (
                          <Clock3 className="size-4 shrink-0" />
                        )}
                        {isHistoryOpen ? (
                          <span className="truncate">{session.title}</span>
                        ) : null}
                      </span>
                      {isHistoryOpen ? (
                        <span className="mt-1 block text-xs text-white/45">
                          {formatTime(session.updatedAt)}
                        </span>
                      ) : null}
                    </button>
                  );
                  })}
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-h-[680px] flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
              {activeSession.messages.map((message) => (
                <article
                  key={message.id}
                  className={`flex ${
                    message.role === "staff" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[820px] rounded-lg border px-4 py-3 leading-7 shadow-sm ${
                      message.role === "staff"
                        ? "border-cyan-300/35 bg-cyan-500/16 text-white"
                        : "border-white/14 bg-white/9 text-white/82"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-white/52">
                      {message.role === "staff" ? (
                        "צוות"
                      ) : (
                        <>
                          <Sparkles className="size-3.5" />
                          AI
                        </>
                      )}
                    </div>
                    {message.role === "assistant" ? (
                      <FitCheckMarkdown content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.meta ? (
                      <p className="mt-2 text-xs text-white/42" dir="ltr">
                        {message.meta}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-white/12 bg-slate-950/30 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 rounded-lg border border-white/18 bg-slate-950/55 p-3 shadow-inner shadow-black/20 focus-within:border-white/36 sm:flex-row sm:items-end">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="הקלידו שאלה או תיאור התאמה לבדיקה"
                  rows={2}
                  className="min-h-16 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-white/42"
                />
                <Button
                  type="submit"
                  disabled={
                    !prompt.trim() ||
                    isSending ||
                    (scopeMode === "manual" && selectedUsers.length === 0)
                  }
                  className="h-11 min-w-28 bg-white text-slate-950 hover:bg-white/90"
                >
                  {isSending ? "בודק..." : "שליחה"}
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4 scale-x-[-1]" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

function FitCheckMarkdown({ content }: { content: string }) {
  return (
    <div className="fit-check-markdown space-y-4 text-right">
      <ReactMarkdown
        components={fitCheckMarkdownComponents}
        remarkPlugins={[remarkGfm, remarkMergeFitCheckUserColumns]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

const fitCheckMarkdownComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={cn("text-xl font-semibold leading-8 text-white", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("text-lg font-semibold leading-8 text-white", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("text-base font-semibold leading-7 text-white", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("text-sm font-semibold leading-7 text-white", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("whitespace-pre-wrap leading-7", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("list-disc space-y-2 pr-5 leading-7", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("list-decimal space-y-2 pr-5 leading-7", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("pr-1", className)} {...props} />,
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-white", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium text-cyan-100 underline underline-offset-4", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("border-r-2 border-white/24 pr-4 text-white/70", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn("rounded bg-slate-950/40 px-1 py-0.5 text-[0.9em]", className)}
      dir="ltr"
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-md border border-white/14 bg-slate-950/35 p-3 text-left text-xs leading-6",
        className
      )}
      dir="ltr"
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="max-w-full overflow-x-auto rounded-md border border-white/14">
      <table
        className={cn("w-full min-w-[620px] border-collapse text-right text-sm", className)}
        dir="rtl"
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => <thead className={cn("bg-white/10", className)} {...props} />,
  tr: ({ className, ...props }) => (
    <tr className={cn("border-b border-white/10 last:border-0", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn("px-3 py-2 text-right font-semibold text-white", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("align-top px-3 py-2 text-right text-white/78", className)} {...props} />
  ),
};

type MarkdownAstNode = {
  type: string;
  value?: string;
  align?: Array<unknown>;
  children?: MarkdownAstNode[];
};

function remarkMergeFitCheckUserColumns() {
  return (tree: MarkdownAstNode) => {
    visitMarkdownAst(tree, (node) => {
      if (node.type !== "table") return;
      mergeFitCheckUserColumns(node);
    });
  };
}

function visitMarkdownAst(node: MarkdownAstNode, visitor: (node: MarkdownAstNode) => void) {
  visitor(node);
  node.children?.forEach((child) => visitMarkdownAst(child, visitor));
}

function mergeFitCheckUserColumns(table: MarkdownAstNode) {
  const rows = table.children ?? [];
  const headerRow = rows[0];
  const headerCells = headerRow?.children ?? [];
  const nameIndex = headerCells.findIndex((cell) => isNameHeader(markdownText(cell)));
  const emailIndex = headerCells.findIndex((cell) => isEmailHeader(markdownText(cell)));

  if (nameIndex === -1 || emailIndex === -1 || nameIndex === emailIndex) return;

  const firstIndex = Math.min(nameIndex, emailIndex);
  const secondIndex = Math.max(nameIndex, emailIndex);
  if (table.align) {
    table.align = table.align.filter((_, index) => index !== secondIndex);
  }

  rows.forEach((row, rowIndex) => {
    const cells = row.children ?? [];
    const nameCell = cells[nameIndex];
    const emailCell = cells[emailIndex];
    const mergedCells = cells.filter((_, index) => index !== secondIndex);

    if (rowIndex === 0) {
      mergedCells[firstIndex] = tableCell([{ type: "text", value: "מאובחן" }]);
    } else {
      mergedCells[firstIndex] = tableCell([
        ...cloneMarkdownChildren(nameCell),
        { type: "break" },
        ...cloneMarkdownChildren(emailCell),
      ]);
    }

    row.children = mergedCells;
  });
}

function tableCell(children: MarkdownAstNode[]): MarkdownAstNode {
  return { type: "tableCell", children };
}

function cloneMarkdownChildren(node?: MarkdownAstNode) {
  return (node?.children ?? []).map((child) => cloneMarkdownNode(child));
}

function cloneMarkdownNode(node: MarkdownAstNode): MarkdownAstNode {
  return {
    ...node,
    children: node.children?.map((child) => cloneMarkdownNode(child)),
  };
}

function markdownText(node?: MarkdownAstNode): string {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(markdownText).join("");
}

function isNameHeader(value: string) {
  return ["שם", "שם המאובחן", "מאובחן"].includes(value.trim());
}

function isEmailHeader(value: string) {
  return ["אימייל", "מייל", "email", "e-mail"].includes(value.trim().toLowerCase());
}

function normalizeApiSessions(value: unknown): ChatSession[] {
  if (!Array.isArray(value)) return [];

  return value.map(normalizeApiSession).filter(Boolean);
}

function normalizeApiSession(value: unknown): ChatSession {
  const raw = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const now = new Date().toISOString();

  return {
    id: typeof raw.id === "string" ? raw.id : `session-${Date.now()}`,
    title: typeof raw.title === "string" ? raw.title : "בדיקה חדשה",
    scopeMode: raw.scopeMode === "manual" ? "manual" : "all",
    selectedUsers: normalizeApiUsers(raw.selectedUsersSnapshot),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
    messages: normalizeApiMessages(raw.messages),
    provider: typeof raw.provider === "string" ? raw.provider : null,
    model: typeof raw.model === "string" ? raw.model : null,
  };
}

function normalizeApiUsers(value: unknown): FitCheckUser[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): FitCheckUser | null => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const id = typeof raw.id === "string" ? raw.id : "";
      if (!id) return null;

      return {
        id,
        email: typeof raw.email === "string" ? raw.email : null,
        fullName: typeof raw.fullName === "string" ? raw.fullName : null,
        permissions:
          typeof raw.permissions === "string" ? raw.permissions : "User",
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
        lastSignInAt:
          typeof raw.lastSignInAt === "string" ? raw.lastSignInAt : null,
      };
    })
    .filter((item): item is FitCheckUser => item !== null);
}

function normalizeApiMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return initialSession.messages;

  const messages = value
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const content = typeof raw.content === "string" ? raw.content : "";
      if (!content.trim()) return null;

      return {
        id: typeof raw.id === "string" ? raw.id : `message-${Date.now()}`,
        role: raw.role === "staff" ? "staff" : "assistant",
        content,
        createdAt:
          typeof raw.createdAt === "string"
            ? raw.createdAt
            : new Date().toISOString(),
        meta: typeof raw.meta === "string" ? raw.meta : undefined,
      };
    })
    .filter((item): item is ChatMessage => item !== null);

  return messages.length > 0 ? messages : initialSession.messages;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
