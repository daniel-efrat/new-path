"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Row {
  occupation_serial: number;
  occupation_title: string;
  occupation_description: string | null;
  statement_serial: number;
  statement: string;
}

export default function OccupationDetailPage() {
  const router = useRouter();
  const params = useParams<{ serial: string }>();
  const serial = Number(params?.serial);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!serial || Number.isNaN(serial)) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("designation_statements")
        .select(
          "occupation_serial, occupation_title, occupation_description, statement_serial, statement"
        )
        .eq("occupation_serial", serial)
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
  }, [serial]);

  const info = useMemo(() => {
    if (!rows.length) return { title: "", desc: "" };
    return {
      title: rows[0].occupation_title,
      desc: rows[0].occupation_description || "",
    };
  }, [rows]);

  const canToggle = (sn: number) => selected.has(sn) || selected.size < 2;
  const onToggle = (sn: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sn)) next.delete(sn);
      else if (next.size < 2) next.add(sn);
      return next;
    });
  };

  const handleDone = () => {
    // For now, navigate back to questionnaire main step view.
    router.push("/questionnaire");
  };

  return (
    <div className="max-w-3xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold my-6 text-center">
        {info.title || `תחום #${serial}`}
      </h2>
      {info.desc && (
        <p className="text-center text-muted-foreground mb-4">{info.desc}</p>
      )}

      <Card className="bg-white text-background">
        <CardContent className="p-4">
          {loading && <p className="text-sm text-gray-600">טוען משפטים...</p>}
          {error && <p className="text-sm text-destructive">שגיאה: {error}</p>}

          {!loading && !error && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-foreground">
                  בחר/י עד 2 משפטים (נבחרו {selected.size}/2)
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelected(new Set())}
                >
                  אפס בחירה
                </Button>
              </div>
              <ul className="divide-y text-background">
                {rows.map((r) => {
                  const checked = selected.has(r.statement_serial);
                  const disabled = !checked && !canToggle(r.statement_serial);
                  return (
                    <li
                      key={r.statement_serial}
                      className="py-2 flex items-center"
                    >
                      <label
                        className={`flex items-center gap-3 ${
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

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => router.back()}>
                  חזור
                </Button>
                <Button onClick={handleDone} disabled={selected.size !== 2}>
                  המשך
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
