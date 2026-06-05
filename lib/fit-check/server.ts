import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ProfilePermission } from "@/lib/permissions";

export type FitCheckProvider = "openai" | "openrouter";
export type FitCheckScopeMode = "all" | "manual";

export interface FitCheckChatMessage {
  id?: string;
  role: "staff" | "assistant";
  content: string;
  createdAt?: string;
  meta?: string;
}

export interface FitCheckSearchUser {
  id: string;
  email: string | null;
  fullName: string | null;
  permissions: ProfilePermission;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export interface FitCheckGeneration {
  answer: string;
  provider: FitCheckProvider;
  model: string;
}

export interface FitCheckSession {
  id: string;
  title: string;
  scopeMode: FitCheckScopeMode;
  selectedUserIds: string[];
  selectedUsersSnapshot: FitCheckSearchUser[];
  messages: FitCheckChatMessage[];
  provider: FitCheckProvider | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FitCheckSessionRow {
  id: string;
  title: string;
  scope_mode: FitCheckScopeMode;
  selected_user_ids: string[];
  selected_users_snapshot: FitCheckSearchUser[];
  messages: FitCheckChatMessage[];
  provider: FitCheckProvider | null;
  model: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  permissions: ProfilePermission;
  created_at: string | null;
}

interface FitCheckContextUser extends FitCheckSearchUser {
  counts: {
    submissions: number;
    answers: number;
    guidanceReports: number;
    diagnosticReports: number;
    hollandResults: number;
    designationChoices: number;
  };
  activity: {
    submissions: unknown;
    progress: unknown;
    hollandResults: unknown;
    designationChoices: unknown;
    guidanceReports: unknown;
    diagnosticReports: unknown;
  };
}

export async function searchFitCheckUsers(
  serviceSupabase: SupabaseClient,
  query: string,
  limit = 12
): Promise<FitCheckSearchUser[]> {
  const users = await listFitCheckUsers(serviceSupabase);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = normalizedQuery
    ? users.filter((user) =>
        [user.email, user.fullName]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery))
      )
    : users;

  return filteredUsers.slice(0, limit);
}

export async function listFitCheckSessions(
  serviceSupabase: SupabaseClient,
  staffUserId: string
): Promise<FitCheckSession[]> {
  const { data, error } = await serviceSupabase
    .from("fit_check_sessions")
    .select(
      "id, title, scope_mode, selected_user_ids, selected_users_snapshot, messages, provider, model, created_at, updated_at"
    )
    .eq("staff_user_id", staffUserId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return ((data ?? []) as FitCheckSessionRow[]).map(toFitCheckSession);
}

export async function createFitCheckSession(
  serviceSupabase: SupabaseClient,
  staffUserId: string
): Promise<FitCheckSession> {
  const { data, error } = await serviceSupabase
    .from("fit_check_sessions")
    .insert({
      staff_user_id: staffUserId,
      title: "בדיקה חדשה",
      scope_mode: "all",
      messages: [createWelcomeMessage()],
    })
    .select(
      "id, title, scope_mode, selected_user_ids, selected_users_snapshot, messages, provider, model, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Could not create fit-check session.");
  }

  return toFitCheckSession(data as FitCheckSessionRow);
}

export async function saveFitCheckSession(
  serviceSupabase: SupabaseClient,
  {
    staffUserId,
    sessionId,
    title,
    scopeMode,
    selectedUsers,
    messages,
    provider,
    model,
  }: {
    staffUserId: string;
    sessionId: string;
    title: string;
    scopeMode: FitCheckScopeMode;
    selectedUsers: FitCheckSearchUser[];
    messages: FitCheckChatMessage[];
    provider?: FitCheckProvider | null;
    model?: string | null;
  }
): Promise<FitCheckSession> {
  const selectedUserIds = selectedUsers.map((user) => user.id);
  const { data, error } = await serviceSupabase
    .from("fit_check_sessions")
    .update({
      title: title.trim() || "בדיקה חדשה",
      scope_mode: scopeMode,
      selected_user_ids: selectedUserIds,
      selected_users_snapshot: selectedUsers,
      messages: sanitizeSessionMessages(messages),
      provider: provider ?? null,
      model: model ?? null,
    })
    .eq("id", sessionId)
    .eq("staff_user_id", staffUserId)
    .select(
      "id, title, scope_mode, selected_user_ids, selected_users_snapshot, messages, provider, model, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Could not save fit-check session.");
  }

  return toFitCheckSession(data as FitCheckSessionRow);
}

export async function generateFitCheckAnswer({
  serviceSupabase,
  question,
  messages,
  scopeMode,
  userIds,
}: {
  serviceSupabase: SupabaseClient;
  question: string;
  messages: FitCheckChatMessage[];
  scopeMode: FitCheckScopeMode;
  userIds: string[];
}): Promise<FitCheckGeneration> {
  const scopedUsers = await loadFitCheckContext(serviceSupabase, {
    scopeMode,
    userIds,
  });
  const { systemPrompt, userPrompt } = buildFitCheckPrompt({
    question,
    messages,
    scopeMode,
    scopedUsers,
  });
  const openAiModel =
    process.env.FIT_CHECK_OPENAI_MODEL ||
    process.env.OPENAI_MODEL ||
    "gpt-5.4-mini";

  try {
    return {
      answer: await generateWithOpenAI(systemPrompt, userPrompt, openAiModel),
      provider: "openai",
      model: openAiModel,
    };
  } catch (openAiError) {
    console.warn("OpenAI fit-check chat failed; trying OpenRouter.", {
      message:
        openAiError instanceof Error ? openAiError.message : String(openAiError),
    });
  }

  const openRouterModel =
    process.env.FIT_CHECK_OPENROUTER_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "deepseek/deepseek-v4-pro";

  return {
    answer: await generateWithOpenRouter(
      systemPrompt,
      userPrompt,
      openRouterModel
    ),
    provider: "openrouter",
    model: openRouterModel,
  };
}

async function loadFitCheckContext(
  serviceSupabase: SupabaseClient,
  {
    scopeMode,
    userIds,
  }: {
    scopeMode: FitCheckScopeMode;
    userIds: string[];
  }
): Promise<FitCheckContextUser[]> {
  const allUsers = await listFitCheckUsers(serviceSupabase);
  const requestedIds = new Set(userIds);
  const scopedUsers =
    scopeMode === "manual"
      ? allUsers.filter((user) => requestedIds.has(user.id)).slice(0, 20)
      : allUsers.slice(0, 60);

  return Promise.all(
    scopedUsers.map((user) => loadFitCheckUserData(serviceSupabase, user))
  );
}

async function loadFitCheckUserData(
  serviceSupabase: SupabaseClient,
  user: FitCheckSearchUser
): Promise<FitCheckContextUser> {
  const [
    submissionsResult,
    progressResult,
    hollandResult,
    designationResult,
    guidanceResult,
    diagnosticResult,
    submissionsCount,
    guidanceCount,
    diagnosticCount,
    hollandCount,
    designationCount,
    answersCount,
  ] = await Promise.all([
    serviceSupabase
      .from("questionnaire_submissions")
      .select("id, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    serviceSupabase
      .from("user_questionnaire_progress")
      .select("steps_progress, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    serviceSupabase
      .from("holland_results")
      .select("id, riasec_code, riasec_vector, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    serviceSupabase
      .from("user_designation_choices")
      .select("occupation_serial, rank, selected_statements, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(8),
    serviceSupabase
      .from("guidance_reports")
      .select("id, submission_id, status, provider, model, report_json, created_at, updated_at, error_message")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2),
    serviceSupabase
      .from("diagnostic_reports")
      .select("id, submission_id, status, provider, model, report_json, created_at, updated_at, error_message")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2),
    countRows(
      serviceSupabase
        .from("questionnaire_submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    ),
    countRows(
      serviceSupabase
        .from("guidance_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    ),
    countRows(
      serviceSupabase
        .from("diagnostic_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    ),
    countRows(
      serviceSupabase
        .from("holland_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    ),
    countRows(
      serviceSupabase
        .from("user_designation_choices")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    ),
    countAnswers(serviceSupabase, user.id),
  ]);

  const possibleErrors = [
    submissionsResult.error,
    progressResult.error,
    hollandResult.error,
    designationResult.error,
    guidanceResult.error,
    diagnosticResult.error,
  ].filter(Boolean);

  if (possibleErrors.length > 0) {
    throw possibleErrors[0];
  }

  return {
    ...user,
    counts: {
      submissions: submissionsCount,
      answers: answersCount,
      guidanceReports: guidanceCount,
      diagnosticReports: diagnosticCount,
      hollandResults: hollandCount,
      designationChoices: designationCount,
    },
    activity: {
      submissions: compactJson(submissionsResult.data ?? []),
      progress: compactJson(progressResult.data ?? null),
      hollandResults: compactJson(hollandResult.data ?? []),
      designationChoices: compactJson(designationResult.data ?? []),
      guidanceReports: compactJson(guidanceResult.data ?? []),
      diagnosticReports: compactJson(diagnosticResult.data ?? []),
    },
  };
}

async function listFitCheckUsers(
  serviceSupabase: SupabaseClient
): Promise<FitCheckSearchUser[]> {
  const [authUsers, profilesResult] = await Promise.all([
    listAllAuthUsers(serviceSupabase),
    serviceSupabase
      .from("profiles")
      .select("id, full_name, permissions, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  const profilesById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return authUsers.map((authUser) => {
    const profile = profilesById.get(authUser.id);

    return {
      id: authUser.id,
      email: authUser.email ?? null,
      fullName: profile?.full_name ?? null,
      permissions: profile?.permissions ?? "User",
      createdAt: profile?.created_at ?? authUser.created_at ?? null,
      lastSignInAt: authUser.last_sign_in_at ?? null,
    };
  });
}

async function listAllAuthUsers(serviceSupabase: SupabaseClient): Promise<User[]> {
  const users: User[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await serviceSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const pageUsers = data?.users ?? [];
    users.push(...pageUsers);

    if (pageUsers.length < perPage) {
      return users;
    }

    page += 1;
  }
}

async function countRows(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function countAnswers(serviceSupabase: SupabaseClient, userId: string) {
  const { data: submissions, error: submissionsError } = await serviceSupabase
    .from("questionnaire_submissions")
    .select("id")
    .eq("user_id", userId);

  if (submissionsError) throw submissionsError;

  const submissionIds = (submissions ?? []).map(
    (submission: { id: string }) => submission.id
  );
  if (submissionIds.length === 0) return 0;

  const { count, error } = await serviceSupabase
    .from("answers")
    .select("id", { count: "exact", head: true })
    .in("submission_id", submissionIds);

  if (error) throw error;
  return count ?? 0;
}

function buildFitCheckPrompt({
  question,
  messages,
  scopeMode,
  scopedUsers,
}: {
  question: string;
  messages: FitCheckChatMessage[];
  scopeMode: FitCheckScopeMode;
  scopedUsers: FitCheckContextUser[];
}) {
  const systemPrompt = [
    "אתה עוזר AI מקצועי לצוות דרך חדשה.",
    "ענה בעברית טבעית וברורה על שאלות צוות לגבי התאמה תעסוקתית, נתוני מאובחנים, דוחות, פעילות והרשאות.",
    "יש לך גישה רק לנתונים שסופקו בהודעת המשתמש. אל תמציא נתונים שאינם קיימים בקונטקסט.",
    "מותר להשוות בין מאובחנים, לסכם דוחות ולזהות פערים, אבל יש להציג אי-ודאות כשאין מספיק נתונים.",
    "אין לבצע אבחון קליני, ואין להציג המלצות כקביעה מוחלטת. ניסוח טוב: נראה, כדאי לבדוק, על בסיס הנתונים הקיימים.",
    "כאשר השאלה מבקשת פעולה במערכת, הסבר מה ניתן לראות או לבדוק; אל תטען שביצעת שינוי אם לא בוצע שינוי דרך API ייעודי.",
    "כאשר אתה מחזיר טבלה על מאובחנים, השתמש בעמודה אחת בשם ׳מאובחן׳ וכתוב בה שם ומייל יחד; אל תפצל לעמודות ׳שם׳ ו׳אימייל׳.",
  ].join("\n");

  const recentMessages = messages.slice(-10).map((message) => ({
    role: message.role === "staff" ? "צוות" : "AI",
    content: message.content.slice(0, 2000),
  }));

  const userPrompt = [
    "שאלה נוכחית:",
    question,
    "",
    "Scope:",
    scopeMode === "all" ? "כל המאובחנים" : "בחירה ידנית",
    "",
    "היסטוריית שיחה אחרונה:",
    JSON.stringify(recentMessages, null, 2),
    "",
    "נתוני DB זמינים:",
    JSON.stringify(scopedUsers, null, 2),
    "",
    "ענה בעברית טבעית. אם יש יותר ממאובחן אחד רלוונטי, ציין שם ואימייל יחד כדי שיהיה ברור למי אתה מתייחס.",
  ].join("\n");

  return { systemPrompt, userPrompt };
}

function createWelcomeMessage(): FitCheckChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    createdAt: new Date().toISOString(),
    content:
      "אפשר להזין כאן פרטי מאובחן/ת, מקצוע, מסלול לימודים או תרחיש תעסוקתי לבדיקה ראשונית.",
  };
}

function toFitCheckSession(row: FitCheckSessionRow): FitCheckSession {
  return {
    id: row.id,
    title: row.title,
    scopeMode: row.scope_mode,
    selectedUserIds: row.selected_user_ids ?? [],
    selectedUsersSnapshot: row.selected_users_snapshot ?? [],
    messages:
      Array.isArray(row.messages) && row.messages.length > 0
        ? sanitizeSessionMessages(row.messages)
        : [createWelcomeMessage()],
    provider: row.provider,
    model: row.model,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeSessionMessages(messages: FitCheckChatMessage[]) {
  return messages
    .map((message): FitCheckChatMessage => {
      const role: FitCheckChatMessage["role"] =
        message.role === "assistant" ? "assistant" : "staff";

      return {
        id: message.id || `${role}-${Date.now()}`,
        role,
        content: String(message.content ?? "").slice(0, 20000),
        createdAt: message.createdAt || new Date().toISOString(),
        ...(message.meta ? { meta: String(message.meta).slice(0, 500) } : {}),
      };
    })
    .filter((message) => message.content.trim())
    .slice(-80);
}

async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model: string
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      reasoning: { effort: "low" },
      max_output_tokens: 3000,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || `OpenAI request failed with ${response.status}.`
    );
  }

  return extractOpenAIText(payload);
}

async function generateWithOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  model: string
) {
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENROUTER_KEY ||
    process.env.OPRNROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "New Path Fit Check",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.25,
      max_tokens: 3000,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        `OpenRouter request failed with ${response.status}.`
    );
  }

  return extractOpenRouterText(payload);
}

function extractOpenAIText(payload: any): string {
  const chunks: string[] = [];

  if (typeof payload?.output_text === "string") {
    chunks.push(payload.output_text);
  }

  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  const text = chunks.join("\n").trim();
  if (!text) {
    throw new Error("OpenAI response did not include text.");
  }

  return text;
}

function extractOpenRouterText(payload: any): string {
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenRouter response did not include text.");
  }

  return text.trim();
}

function compactJson(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, nestedValue) => {
      if (typeof nestedValue === "string" && nestedValue.length > 1400) {
        return `${nestedValue.slice(0, 1400)}...`;
      }

      if (Array.isArray(nestedValue) && nestedValue.length > 12) {
        return nestedValue.slice(0, 12);
      }

      return nestedValue;
    })
  );
}
