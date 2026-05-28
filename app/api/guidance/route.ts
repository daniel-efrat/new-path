import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  generateGuidanceReport,
  hashGuidanceInput,
  loadGuidanceInput,
} from "@/lib/guidance/server";
import type {
  GuidanceApiError,
  GuidanceApiResponse,
  GuidanceReport,
} from "@/lib/guidance/types";

interface GuidanceReportRow {
  id: string;
  report_json: GuidanceReport | null;
  provider: "gemini" | "openrouter";
  model: string;
  input_hash: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GuidanceApiResponse | GuidanceApiError>> {
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
      .from("guidance_reports")
      .select("id, report_json, provider, model, input_hash")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("report_json", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedError) {
      throw new Error(`Could not load saved guidance: ${savedError.message}`);
    }

    if (!saved?.report_json) {
      return NextResponse.json(
        { error: "No saved guidance report was found." },
        { status: 404 }
      );
    }

    return NextResponse.json(toResponse(saved as GuidanceReportRow, true));
  } catch (error) {
    console.error("Guidance API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load saved guidance report.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GuidanceApiResponse | GuidanceApiError>> {
  const supabase = createAuthenticatedClient(request);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const input = await loadGuidanceInput(supabase, user.id);
    const inputHash = hashGuidanceInput(input);

    const { data: cached, error: cachedError } = await supabase
      .from("guidance_reports")
      .select("id, report_json, provider, model, input_hash")
      .eq("user_id", user.id)
      .eq("submission_id", input.submissionId)
      .eq("input_hash", inputHash)
      .maybeSingle();

    if (cachedError) {
      throw new Error(`Could not check cached guidance: ${cachedError.message}`);
    }

    if (cached?.report_json) {
      return NextResponse.json(toResponse(cached as GuidanceReportRow, true));
    }

    const generation = await generateGuidanceReport(input);

    const { data: inserted, error: insertError } = await supabase
      .from("guidance_reports")
      .upsert({
        user_id: user.id,
        submission_id: input.submissionId,
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
      throw new Error(`Could not save guidance report: ${insertError.message}`);
    }

    return NextResponse.json(toResponse(inserted as GuidanceReportRow, false));
  } catch (error) {
    console.error("Guidance API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate guidance report.",
      },
      { status: 500 }
    );
  }
}

function toResponse(row: GuidanceReportRow, cached: boolean): GuidanceApiResponse {
  return {
    report: row.report_json as GuidanceReport,
    reportId: row.id,
    inputHash: row.input_hash,
    provider: row.provider,
    model: row.model,
    cached,
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
