import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requireStaffContext } from "@/lib/admin";
import {
  generateFitCheckAnswer,
  saveFitCheckSession,
  type FitCheckChatMessage,
  type FitCheckSearchUser,
  type FitCheckScopeMode,
} from "@/lib/fit-check/server";

interface FitCheckChatRequest {
  sessionId?: unknown;
  title?: unknown;
  question?: unknown;
  messages?: unknown;
  scope?: {
    mode?: unknown;
    userIds?: unknown;
    selectedUsers?: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { serviceSupabase, user } = await requireStaffContext();
    const body = (await request.json()) as FitCheckChatRequest;
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const title =
      typeof body.title === "string" ? body.title.trim() : "בדיקה חדשה";
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const scopeMode = normalizeScopeMode(body.scope?.mode);
    const userIds = normalizeUserIds(body.scope?.userIds);
    const selectedUsers = normalizeSelectedUsers(body.scope?.selectedUsers);
    const messages = normalizeMessages(body.messages);

    if (!sessionId) {
      return NextResponse.json(
        { error: "חסרה שיחת בדיקת התאמה לשמירה." },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "יש להזין שאלה לבדיקה." },
        { status: 400 }
      );
    }

    if (scopeMode === "manual" && userIds.length === 0) {
      return NextResponse.json(
        { error: "יש לבחור לפחות מאובחן אחד עבור בחירה ידנית." },
        { status: 400 }
      );
    }

    const generation = await generateFitCheckAnswer({
      serviceSupabase,
      question,
      messages,
      scopeMode,
      userIds,
    });
    const now = new Date().toISOString();
    const assistantMessage: FitCheckChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      createdAt: now,
      content: generation.answer,
      meta: `${generation.provider} / ${generation.model}`,
    };
    const session = await saveFitCheckSession(serviceSupabase, {
      staffUserId: user.id,
      sessionId,
      title,
      scopeMode,
      selectedUsers,
      messages: [...messages, assistantMessage],
      provider: generation.provider,
      model: generation.model,
    });

    return NextResponse.json({ ...generation, session, assistantMessage });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Fit-check chat API error:", error);
    return NextResponse.json(
      { error: "לא הצלחנו להשלים את בדיקת ההתאמה." },
      { status: 500 }
    );
  }
}

function normalizeScopeMode(value: unknown): FitCheckScopeMode {
  return value === "manual" ? "manual" : "all";
}

function normalizeUserIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeMessages(value: unknown): FitCheckChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): FitCheckChatMessage | null => {
      if (!item || typeof item !== "object") return null;
      const raw = item as {
        id?: unknown;
        role?: unknown;
        content?: unknown;
        createdAt?: unknown;
        meta?: unknown;
      };
      const role = raw.role === "assistant" ? "assistant" : "staff";
      const content = typeof raw.content === "string" ? raw.content.trim() : "";
      return content
        ? {
            id: typeof raw.id === "string" ? raw.id : undefined,
            role,
            content: content.slice(0, 4000),
            createdAt:
              typeof raw.createdAt === "string" ? raw.createdAt : undefined,
            meta: typeof raw.meta === "string" ? raw.meta : undefined,
          }
        : null;
    })
    .filter((item): item is FitCheckChatMessage => item !== null)
    .slice(-12);
}

function normalizeSelectedUsers(value: unknown): FitCheckSearchUser[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): FitCheckSearchUser | null => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const id = typeof raw.id === "string" ? raw.id.trim() : "";
      if (!id) return null;

      return {
        id,
        email: typeof raw.email === "string" ? raw.email : null,
        fullName: typeof raw.fullName === "string" ? raw.fullName : null,
        permissions:
          raw.permissions === "Admin" || raw.permissions === "Advisor"
            ? raw.permissions
            : "User",
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
        lastSignInAt:
          typeof raw.lastSignInAt === "string" ? raw.lastSignInAt : null,
      };
    })
    .filter((item): item is FitCheckSearchUser => item !== null)
    .slice(0, 20);
}
