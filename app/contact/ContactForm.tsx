"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "שליחת הפנייה נכשלה");
      }

      form.reset();
      setStatus({
        type: "success",
        message: "הפנייה נשלחה ונשמרה בהצלחה. נחזור אליך בהקדם.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "שליחת הפנייה נכשלה",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/18 bg-slate-950/24 p-5 backdrop-blur md:p-6"
    >
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-white" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-white">השארת פרטים</h2>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="contact-name" className="text-white">
            שם
          </Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            placeholder="שם מלא"
            autoComplete="name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email" className="text-white">
            אימייל
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-phone" className="text-white">
            טלפון
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="050-0000000"
            autoComplete="tel"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-message" className="text-white">
            הודעה
          </Label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="איך נוכל לעזור?"
            rows={5}
            required
            className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {status ? (
        <p
          role="status"
          className={`mt-4 rounded-md border p-3 text-sm leading-6 ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <Button type="submit" className="mt-6 w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? "שולח..." : "שליחה"}
        <Send className="h-4 w-4" aria-hidden="true" />
      </Button>
      <p className="mt-3 text-center text-xs leading-5 text-white/58">
        הפנייה תישמר במערכת ותישלח כהודעת אימייל.
      </p>
    </form>
  );
}
