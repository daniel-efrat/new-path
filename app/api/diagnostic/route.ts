import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  generateDiagnosticReport,
  hashDiagnosticInput,
  loadDiagnosticInput,
} from "@/lib/diagnostic/server";
import type {
  DiagnosticApiError,
  DiagnosticApiResponse,
  DiagnosticReport,
} from "@/lib/diagnostic/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<DiagnosticApiResponse | DiagnosticApiError>> {
  const supabase = createAuthenticatedClient(request);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const input = await loadDiagnosticInput(supabase, user.id);
    const inputHash = hashDiagnosticInput(input);

    const { data: cached, error: cachedError } = await supabase
      .from("diagnostic_reports")
      .select("id, report_json, provider, model, input_hash")
      .eq("user_id", user.id)
      .eq("submission_id", input.submissionId)
      .eq("input_hash", inputHash)
      .eq("status", "completed")
      .maybeSingle();

    if (cachedError) {
      throw new Error(
        `Could not check cached diagnostic report: ${cachedError.message}`
      );
    }

    if (cached?.report_json) {
      return NextResponse.json({
        report: cached.report_json as DiagnosticReport,
        reportId: cached.id,
        inputHash: cached.input_hash,
        provider: cached.provider,
        model: cached.model,
        cached: true,
      });
    }

    const generation = await generateDiagnosticReport(input);

    const { data: inserted, error: insertError } = await supabase
      .from("diagnostic_reports")
      .insert({
        user_id: user.id,
        submission_id: input.submissionId,
        guidance_report_id: input.guidanceReportId,
        input_hash: inputHash,
        status: "completed",
        provider: generation.provider,
        model: generation.model,
        input_snapshot: input,
        report_json: generation.report,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(
        `Could not save diagnostic report: ${insertError.message}`
      );
    }

    return NextResponse.json({
      report: generation.report,
      reportId: inserted.id,
      inputHash,
      provider: generation.provider,
      model: generation.model,
      cached: false,
    });
  } catch (error) {
    console.error("Diagnostic API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate diagnostic report.",
      },
      { status: 500 }
    );
  }
}

function createAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }

  return createRouteHandlerClient({ cookies });
}
