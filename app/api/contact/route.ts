import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_CONTACT_RECIPIENT = "ratzimor@013.net";

interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const name = sanitizeField(body.name);
    const email = sanitizeField(body.email);
    const phone = sanitizeField(body.phone);
    const message = sanitizeField(body.message);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "יש למלא שם, אימייל והודעה" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "כתובת האימייל אינה תקינה" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: inserted, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        phone: phone || null,
        message,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(
        insertError?.message || "Could not save contact message."
      );
    }

    try {
      await sendContactEmail({ name, email, phone, message });
      await supabase
        .from("contact_messages")
        .update({ status: "emailed", email_error: null })
        .eq("id", inserted.id);

      return NextResponse.json({ ok: true });
    } catch (emailError) {
      const emailErrorMessage =
        emailError instanceof Error ? emailError.message : String(emailError);

      await supabase
        .from("contact_messages")
        .update({
          status: "email_failed",
          email_error: emailErrorMessage.slice(0, 500),
        })
        .eq("id", inserted.id);

      console.error("Contact email failed:", emailError);
      return NextResponse.json(
        {
          error:
            "הפנייה נשמרה, אך שליחת האימייל נכשלה. ניתן לפנות גם ישירות בטלפון או באימייל.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "שליחת הפנייה נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service configuration.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sendContactEmail(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  const from = process.env.CONTACT_EMAIL_FROM || "דרך חדשה <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: process.env.CONTACT_EMAIL_TO || DEFAULT_CONTACT_RECIPIENT,
      reply_to: input.email,
      subject: `פנייה חדשה מאתר דרך חדשה - ${input.name}`,
      text: [
        "פנייה חדשה מטופס צור קשר",
        "",
        `שם: ${input.name}`,
        `אימייל: ${input.email}`,
        `טלפון: ${input.phone || "לא נמסר"}`,
        "",
        "הודעה:",
        input.message,
      ].join("\n"),
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.message || payload?.error || `Resend failed with ${response.status}.`
    );
  }
}

function sanitizeField(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
