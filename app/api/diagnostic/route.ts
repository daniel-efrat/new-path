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
  DiagnosticProvider,
  DiagnosticReport,
} from "@/lib/diagnostic/types";

interface DiagnosticReportRow {
  id: string;
  report_json: DiagnosticReport | null;
  provider: DiagnosticProvider;
  model: string;
  input_hash: string;
}

export async function GET(
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

    const { data: saved, error: savedError } = await supabase
      .from("diagnostic_reports")
      .select("id, report_json, provider, model, input_hash")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("report_json", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedError) {
      throw new Error(
        `Could not load saved diagnostic report: ${savedError.message}`
      );
    }

    if (!saved?.report_json) {
      return NextResponse.json(
        { error: "No saved diagnostic report was found." },
        { status: 404 }
      );
    }

    return NextResponse.json(toResponse(saved as DiagnosticReportRow, true));
  } catch (error) {
    console.error("Diagnostic API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load saved diagnostic report.",
      },
      { status: 500 }
    );
  }
}

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
      .maybeSingle();

    if (cachedError) {
      throw new Error(
        `Could not check cached diagnostic report: ${cachedError.message}`
      );
    }

    if (
      cached?.report_json &&
      cached.provider === "openai" &&
      cached.model === (process.env.OPENAI_MODEL || "gpt-5.4-mini")
    ) {
      return NextResponse.json(toResponse(cached as DiagnosticReportRow, true));
    }

    const generation = await generateDiagnosticReport(input);

    const { data: inserted, error: insertError } = await supabase
      .from("diagnostic_reports")
      .upsert({
        user_id: user.id,
        submission_id: input.submissionId,
        guidance_report_id: input.guidanceReportId,
        input_hash: inputHash,
        status: "completed",
        provider: generation.provider,
        model: generation.model,
        input_snapshot: input,
        report_json: generation.report,
      }, {
        onConflict: "user_id,submission_id,input_hash",
      })
      .select("id, report_json, provider, model, input_hash")
      .single();

    if (insertError) {
      throw new Error(
        `Could not save diagnostic report: ${insertError.message}`
      );
    }

    return NextResponse.json(toResponse(inserted as DiagnosticReportRow, false));
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

function toResponse(
  row: DiagnosticReportRow,
  cached: boolean
): DiagnosticApiResponse {
  const report = row.report_json as DiagnosticReport;

  return {
    report,
    reportId: row.id,
    inputHash: row.input_hash,
    provider: row.provider,
    model: row.model,
    cached,
    tokenUsage: report.tokenUsage ?? null,
  };
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
