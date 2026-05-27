"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import supabase, { saveDesignationChoices, type DesignationChoiceRow } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStep12Store } from "@/lib/stores/step12Store";
import { useStepStore } from "@/lib/stores/stepStore";

interface Row {
  occupation_serial: number;
  occupation_title: string;
  occupation_description: string | null;
  statement_serial: number;
  statement: string;
}

export default function Step12FlowPage() {
  const router = useRouter();
  const { selected, order, setSelectionsFor, selectionsBySerial, ensureUser: ensureStep12User } = useStep12Store();
  const { setStepCompletion, ensureUser } = useStepStore();
  const [storeReady, setStoreReady] = useState(false);
  const [index, setIndex] = useState(0);
  const serials = useMemo(
    () => (order.length ? order : selected.map((s) => s.occupation_serial)),
    [order, selected]
  );
  const currentSerial = serials[index];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedTwo, setSelectedTwo] = useState<Set<number>>(new Set());

  useEffect(() => {
    ensureStep12User().finally(() => setStoreReady(true));
  }, [ensureStep12User]);

  useEffect(() => {
    if (!currentSerial) return;
    // initialize from store selections if any
    const pre = new Set<number>(
      (selectionsBySerial[currentSerial] ?? []).slice(0, 2)
    );
    setSelectedTwo(pre);

    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("designation_statements")
        .select(
          "occupation_serial, occupation_title, occupation_description, statement_serial, statement"
        )
        .eq("occupation_serial", currentSerial)
        .order("statement_serial", { ascending: true });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setRows((data || []) as Row[]);
      setLoading(false);
    };
    load();
  }, [currentSerial]);

  const info = useMemo(() => {
    if (!rows.length) return { title: "", desc: "" };
    return {
      title: rows[0].occupation_title,
      desc: rows[0].occupation_description || "",
    };
  }, [rows]);

  const canToggle = (sn: number) => selectedTwo.has(sn) || selectedTwo.size < 2;
  const onToggle = (sn: number) => {
    setSelectedTwo((prev) => {
      const next = new Set(prev);
      if (next.has(sn)) next.delete(sn);
      else if (next.size < 2) next.add(sn);
      return next;
    });
  };

  const persistCurrent = () => {
    setSelectionsFor(
      currentSerial,
      Array.from(selectedTwo).sort((a, b) => a - b)
    );
  };

  const onNext = async () => {
    const currentPicks = Array.from(selectedTwo).sort((a, b) => a - b);
    setSelectionsFor(currentSerial, currentPicks);
    if (index < serials.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Finished all 5. Save selections.
    try {
      // Ensure we have a user
      await ensureUser();
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) throw new Error("לא זוהה משתמש מחובר");

      // Build rows from order and selections (exactly 2 each)
      const ranking = order.length ? order : selected.map(s => s.occupation_serial);
      const completedSelections = {
        ...selectionsBySerial,
        [currentSerial]: currentPicks,
      };
      const rows: DesignationChoiceRow[] = ranking.map((serial, idx) => {
        const picks = (completedSelections[serial] ?? []).slice(0, 2);
        if (picks.length !== 2) {
          throw new Error(`יש להשלים בחירה של 2 משפטים עבור תחום ${serial}`);
        }
        return {
          user_id: userId,
          occupation_serial: serial,
          rank: idx + 1,
          selected_statements: picks,
        };
      });

      await saveDesignationChoices(rows);
      // Mark the designation sentences step completed.
      await setStepCompletion(4, true);
      router.push("/dashboard");
    } catch (e: any) {
      console.error("Failed to save designation choices", e);
      alert(e?.message || "שמירת הבחירות נכשלה");
    }
  };

  const onPrev = () => {
    persistCurrent();
    if (index > 0) setIndex((i) => i - 1);
    else router.back();
  };

  if (!storeReady) {
    return <p className="p-6">טוען...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold my-6 text-center">
        {info.title || `תחום #${currentSerial}`}
      </h2>
      {info.desc && (
        <p className="text-center text-muted-foreground mb-4">{info.desc}</p>
      )}

      <Card className="bg-white text-background">
        <CardContent className="p-4">
          <div className="text-sm text-gray-700 mb-3 text-center">
            תחום {index + 1} מתוך {serials.length} — בחר/י 2 משפטים (נבחרו{" "}
            {selectedTwo.size}/2)
          </div>

          {loading && <p className="text-sm text-gray-600">טוען משפטים...</p>}
          {error && <p className="text-sm text-destructive">שגיאה: {error}</p>}

          {!loading && !error && (
            <ul className="divide-y text-background">
              {rows.map((r) => {
                const checked = selectedTwo.has(r.statement_serial);
                const disabled = !checked && !canToggle(r.statement_serial);
                return (
                  <li key={r.statement_serial} className="py-2">
                    <label
                      className={`flex items-start gap-3 ${
                        disabled ? "opacity-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => onToggle(r.statement_serial)}
                      />
                      <span className="leading-relaxed">
                        {r.statement_serial}. {r.statement}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onPrev}>
              הקודם
            </Button>
            <Button onClick={onNext} disabled={selectedTwo.size !== 2}>
              {index < serials.length - 1 ? "הבא" : "סיום"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
