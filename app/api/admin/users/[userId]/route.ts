import { NextResponse } from "next/server";
import { AdminAuthError, requireStaffContext } from "@/lib/admin";
import type { ProfilePermission } from "@/lib/permissions";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

interface CountResult {
  count: number | null;
  error: unknown;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const { serviceSupabase } = await requireStaffContext();

    const [
      authUserResult,
      profileResult,
      submissionsResult,
      progressResult,
      hollandResult,
      designationResult,
      guidanceResult,
      diagnosticResult,
    ] = await Promise.all([
      serviceSupabase.auth.admin.getUserById(userId),
      serviceSupabase
        .from("profiles")
        .select("id, full_name, permissions, created_at")
        .eq("id", userId)
        .maybeSingle(),
      serviceSupabase
        .from("questionnaire_submissions")
        .select("id, status, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(5),
      serviceSupabase
        .from("user_questionnaire_progress")
        .select("steps_progress, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
      serviceSupabase
        .from("holland_results")
        .select("id, riasec_code, riasec_vector, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      serviceSupabase
        .from("user_designation_choices")
        .select("occupation_serial, rank, selected_statements, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10),
      serviceSupabase
        .from("guidance_reports")
        .select("id, submission_id, status, provider, model, created_at, updated_at, error_message")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      serviceSupabase
        .from("diagnostic_reports")
        .select("id, submission_id, status, provider, model, created_at, updated_at, error_message")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (authUserResult.error || !authUserResult.data.user) {
      return NextResponse.json({ error: "המאובחן לא נמצא." }, { status: 404 });
    }

    const possibleErrors = [
      profileResult.error,
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

    const [
      submissionsCount,
      guidanceCount,
      diagnosticCount,
      hollandCount,
      designationCount,
      answersCount,
    ] = await Promise.all([
      countRows(
        serviceSupabase
          .from("questionnaire_submissions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      ),
      countRows(
        serviceSupabase
          .from("guidance_reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      ),
      countRows(
        serviceSupabase
          .from("diagnostic_reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      ),
      countRows(
        serviceSupabase
          .from("holland_results")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      ),
      countRows(
        serviceSupabase
          .from("user_designation_choices")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      ),
      countAnswers(serviceSupabase, userId),
    ]);

    const authUser = authUserResult.data.user;
    const guidanceRows = guidanceResult.data ?? [];
    const diagnosticRows = diagnosticResult.data ?? [];
    const latestGuidanceBySubmission = new Map(
      guidanceRows
        .filter((row: any) => row.submission_id)
        .map((row: any) => [row.submission_id, row.id])
    );
    const latestDiagnosticBySubmission = new Map(
      diagnosticRows
        .filter((row: any) => row.submission_id)
        .map((row: any) => [row.submission_id, row.id])
    );
    const profile = profileResult.data as
      | {
          id: string;
          full_name: string | null;
          permissions: ProfilePermission;
          created_at: string | null;
        }
      | null;

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email ?? null,
        phone: authUser.phone ?? null,
        createdAt: authUser.created_at ?? null,
        updatedAt: authUser.updated_at ?? null,
        confirmedAt: authUser.confirmed_at ?? null,
        lastSignInAt: authUser.last_sign_in_at ?? null,
        appMetadata: authUser.app_metadata ?? {},
        userMetadata: authUser.user_metadata ?? {},
        profile: {
          fullName: profile?.full_name ?? null,
          permissions: profile?.permissions ?? "User",
          createdAt: profile?.created_at ?? null,
        },
      },
      counts: {
        submissions: submissionsCount,
        answers: answersCount,
        guidanceReports: guidanceCount,
        diagnosticReports: diagnosticCount,
        hollandResults: hollandCount,
        designationChoices: designationCount,
      },
      activity: {
        submissions: (submissionsResult.data ?? []).map((submission: any) => ({
          ...submission,
          guidance_report_id: latestGuidanceBySubmission.get(submission.id) ?? null,
          diagnostic_report_id:
            latestDiagnosticBySubmission.get(submission.id) ?? null,
        })),
        progress: progressResult.data ?? null,
        hollandResults: hollandResult.data ?? [],
        designationChoices: designationResult.data ?? [],
        guidanceReports: guidanceRows,
        diagnosticReports: diagnosticRows,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Staff user detail API error:", error);
    return NextResponse.json(
      { error: "לא הצלחנו לטעון את נתוני המאובחן." },
      { status: 500 }
    );
  }
}

async function countRows(query: PromiseLike<CountResult>) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function countAnswers(serviceSupabase: any, userId: string) {
  const { data: submissions, error: submissionsError } = await serviceSupabase
    .from("questionnaire_submissions")
    .select("id")
    .eq("user_id", userId);

  if (submissionsError) throw submissionsError;

  const submissionIds = (submissions ?? []).map((submission: { id: string }) => submission.id);
  if (submissionIds.length === 0) return 0;

  const { count, error } = await serviceSupabase
    .from("answers")
    .select("id", { count: "exact", head: true })
    .in("submission_id", submissionIds);

  if (error) throw error;
  return count ?? 0;
}
