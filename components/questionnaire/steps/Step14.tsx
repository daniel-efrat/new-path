"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import supabase from "@/lib/supabase";
import { useStep12Store } from "@/lib/stores/step12Store";

interface Step14Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
}

interface StatementRow {
  occupation_serial: number;
  occupation_title: string;
  occupation_description: string | null;
  statement_serial: number;
  statement: string;
}

const MAX_STATEMENTS_PER_DOMAIN = 2;

export default function Step14({ onNext, onComplete }: Step14Props) {
  const {
    selected,
    order,
    selectionsBySerial,
    setSelectionsFor,
    ensureUser,
  } = useStep12Store();
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void ensureUser();
  }, [ensureUser]);

  const orderedDomains = useMemo(() => {
    const bySerial = new Map(
      selected.map((item) => [item.occupation_serial, item])
    );
    const serials = order.length ? order : selected.map((item) => item.occupation_serial);
    return serials
      .map((serial) => bySerial.get(serial))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 5);
  }, [order, selected]);

  const activeDomain = orderedDomains[activeIndex];

  useEffect(() => {
    const loadStatements = async () => {
      setLoading(true);
      setError(null);

      const serials = orderedDomains.map((domain) => domain.occupation_serial);
      if (serials.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("designation_statements")
        .select(
          "occupation_serial, occupation_title, occupation_description, statement_serial, statement"
        )
        .in("occupation_serial", serials)
        .order("occupation_serial", { ascending: true })
        .order("statement_serial", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setRows((data || []) as StatementRow[]);
      setLoading(false);
    };

    void loadStatements();
  }, [orderedDomains]);

  const statementsForActiveDomain = useMemo(() => {
    if (!activeDomain) return [];
    return rows.filter(
      (row) => row.occupation_serial === activeDomain.occupation_serial
    );
  }, [activeDomain, rows]);

  const activeSelections = activeDomain
    ? selectionsBySerial[activeDomain.occupation_serial] || []
    : [];

  const completedDomains = orderedDomains.filter((domain) => {
    const selections = selectionsBySerial[domain.occupation_serial] || [];
    return selections.length >= 1;
  }).length;

  const allDomainsReady =
    orderedDomains.length > 0 && completedDomains === orderedDomains.length;

  const toggleStatement = (statementSerial: number) => {
    if (!activeDomain) return;

    const exists = activeSelections.includes(statementSerial);
    const nextSelections = exists
      ? activeSelections.filter((serial) => serial !== statementSerial)
      : activeSelections.length >= MAX_STATEMENTS_PER_DOMAIN
      ? activeSelections
      : [...activeSelections, statementSerial];

    setSelectionsFor(activeDomain.occupation_serial, nextSelections);
  };

  const saveAndFinish = async () => {
    if (!allDomainsReady) return;

    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("יש להתחבר כדי לשמור את שלב הייעוד האישי.");
        return;
      }

      const payload = orderedDomains.map((domain, index) => ({
        user_id: user.id,
        occupation_serial: domain.occupation_serial,
        rank: index + 1,
        selected_statements: selectionsBySerial[domain.occupation_serial] || [],
      }));

      const { error } = await supabase
        .from("user_designation_choices")
        .upsert(payload, { onConflict: "user_id,occupation_serial" });

      if (error) {
        setError(error.message);
        return;
      }

      await onComplete?.();
      onNext?.();
    } finally {
      setSaving(false);
    }
  };

  if (!orderedDomains.length) {
    return (
      <div className="mx-auto max-w-2xl text-center" dir="rtl">
        <Card className="bg-white text-background">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">ייעוד אישי</h2>
            <p>
              לפני בחירת משפטי הייעוד יש להשלים את נטיות הלב הכלליות ולדרג 5
              תחומי עיסוק.
            </p>
            <Button asChild>
              <a href="/questionnaire?step=11">חזרה לנטיות לב כלליות</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl" dir="rtl">
      <div className="mb-5 text-center text-white">
        <p className="text-sm font-semibold text-cyan-100">שלב ב׳ עם יועץ קריירה</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-normal">
          ייעוד אישי
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-white/85">
          מתוך התחומים שסומנו בנטיות הלב, בוחרים משפט מוביל אחד או שניים
          שמבטאים את תחושת הייעוד בכל תחום.
        </p>
      </div>

      <Card className="bg-white text-background">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                תחום {activeIndex + 1} מתוך {orderedDomains.length}
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">
                {activeDomain?.occupation_title}
              </h3>
              {activeDomain?.occupation_description ? (
                <p className="mt-1 text-sm text-slate-600">
                  {activeDomain.occupation_description}
                </p>
              ) : null}
            </div>
            <div className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800">
              הושלמו {completedDomains}/{orderedDomains.length}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">טוען משפטים...</p>
          ) : error ? (
            <p className="text-sm font-medium text-destructive">שגיאה: {error}</p>
          ) : (
            <div className="max-h-[460px] overflow-y-auto rounded-lg border border-slate-200">
              <ul className="divide-y divide-slate-200">
                {statementsForActiveDomain.map((row) => {
                  const checked = activeSelections.includes(row.statement_serial);
                  const disabled =
                    !checked &&
                    activeSelections.length >= MAX_STATEMENTS_PER_DOMAIN;

                  return (
                    <li key={row.statement_serial}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-slate-50 ${
                          disabled ? "opacity-50" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleStatement(row.statement_serial)}
                        />
                        <span className="leading-7">
                          {row.statement_serial}. {row.statement}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">
              נבחרו בתחום הזה {activeSelections.length}/{MAX_STATEMENTS_PER_DOMAIN}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                disabled={activeIndex === 0}
              >
                הקודם
              </Button>
              {activeIndex < orderedDomains.length - 1 ? (
                <Button
                  type="button"
                  onClick={() =>
                    setActiveIndex((index) =>
                      Math.min(orderedDomains.length - 1, index + 1)
                    )
                  }
                  disabled={activeSelections.length < 1}
                >
                  התחום הבא
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={saveAndFinish}
                  disabled={!allDomainsReady || saving}
                >
                  {saving ? "שומר..." : "סיום שלב ב׳"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
