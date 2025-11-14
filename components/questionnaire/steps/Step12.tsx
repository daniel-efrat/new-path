"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStep12Store } from "@/lib/stores/step12Store";

interface Step12Props {
  onNext?: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void> | void;
}

interface Occupation {
  occupation_serial: number;
  occupation_title: string;
  occupation_description: string | null;
}

export default function Step12({ onPrevious }: Step12Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const { selected, toggleSelect, isSelected } = useStep12Store();

  useEffect(() => {
    const loadOccupations = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("designation_statements")
        .select("occupation_serial, occupation_title, occupation_description")
        .eq("statement_serial", 1)
        .order("occupation_serial", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setOccupations((data || []) as Occupation[]);
      setLoading(false);
    };
    loadOccupations();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim();
    if (!term) return occupations;
    const lower = term.toLowerCase();
    return occupations.filter((o) =>
      o.occupation_title.toLowerCase().includes(lower)
    );
  }, [occupations, search]);

  const canSelectMore = selected.length < 5;

  return (
    <div className="max-w-3xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold my-6 text-center">בחירת תחום עיסוק</h2>

      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex gap-2 items-center mb-4">
            <input
              type="text"
              placeholder="חפש/י תחום עיסוק..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 text-background  focus:ring-primary"
            />
            <Button variant="outline" onClick={() => setSearch("")}>
              נקה
            </Button>
          </div>

          {loading && <p className="text-sm text-gray-600">טוען תחומים...</p>}
          {error && <p className="text-sm text-destructive">שגיאה: {error}</p>}

          {!loading && !error && (
            <ul className="divide-y text-background">
              {filtered.map((o) => (
                <li key={o.occupation_serial}>
                  <label className="flex items-start gap-3 w-full text-right py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={isSelected(o.occupation_serial)}
                      onChange={() => toggleSelect(o)}
                      disabled={
                        !isSelected(o.occupation_serial) && !canSelectMore
                      }
                    />
                    <div className="flex-1">
                      <div className="font-medium text-background">
                        {o.occupation_title}
                      </div>
                      {o.occupation_description ? (
                        <div className="text-sm text-gray-600">
                          {o.occupation_description}
                        </div>
                      ) : null}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              נבחרו {selected.length}/5
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onPrevious}>
                שלב קודם
              </Button>
              <Button
                onClick={() => router.push("/questionnaire/occupation/rank")}
                disabled={selected.length !== 5}
              >
                המשך לדירוג
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
