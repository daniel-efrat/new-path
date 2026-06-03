"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LevelCompleteModal from "@/components/questionnaire/LevelCompleteModal";
import { QUESTIONNAIRE_STEP_TITLES } from "@/lib/constants/questionnaire";
import { useStep12Store } from "@/lib/stores/step12Store";
import { useStepStore } from "@/lib/stores/stepStore";

export default function RankOccupationsPage() {
  const router = useRouter();
  const { selected, order, setOrder, ensureUser } = useStep12Store();
  const { setStepCompletion, ensureUser: ensureStepUser } = useStepStore();
  const [storeReady, setStoreReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [list, setList] = useState<number[]>(order.length ? order : selected.map(s => s.occupation_serial));

  useEffect(() => {
    Promise.all([ensureUser(), ensureStepUser()]).finally(() => {
      const state = useStep12Store.getState();
      setList(
        state.order.length
          ? state.order
          : state.selected.map((item) => item.occupation_serial)
      );
      setStoreReady(true);
    });
  }, [ensureStepUser, ensureUser]);

  useEffect(() => {
    // Keep list in sync if user revisits after changing selections
    const expected = selected.map(s => s.occupation_serial);
    const missing = expected.filter(s => !list.includes(s));
    const extra = list.filter(s => !expected.includes(s));
    if (missing.length || extra.length) {
      setList(expected);
    }
  }, [selected]);

  const titleBySerial = useMemo(() => {
    const map: Record<number, string> = {};
    selected.forEach(s => { map[s.occupation_serial] = s.occupation_title; });
    return map;
  }, [selected]);

  const onDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
  };

  const onDrop = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from)) return;
    e.preventDefault();
    setList(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  };

  const onDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    setList(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const saveAndContinue = async () => {
    setIsSaving(true);
    try {
      setOrder(list);
      await setStepCompletion(11, true);
      setShowLevelComplete(true);
    } catch (error) {
      console.error("Failed to save occupation ranking", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!storeReady) {
    return <p className="p-6">טוען...</p>;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto" dir="rtl">
        <h2 className="text-2xl font-bold my-6 text-center">דרג/י את 5 התחומים הנבחרים (1–5)</h2>

        <Card className="bg-white text-background">
          <CardContent className="p-4">
            <ol className="space-y-2">
              {list.map((serial, idx) => (
                <li
                  key={serial}
                  className="flex items-center justify-between gap-3 border rounded-md p-3"
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-background">{titleBySerial[serial]}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => move(idx, idx - 1)}>למעלה</Button>
                    <Button size="sm" variant="outline" onClick={() => move(idx, idx + 1)}>למטה</Button>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex justify-end items-center mt-6">
              <Button onClick={saveAndContinue} disabled={list.length !== 5 || isSaving}>
                {isSaving ? "שומר..." : "שמור והמשך"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <LevelCompleteModal
        isOpen={showLevelComplete}
        questionnaireName={QUESTIONNAIRE_STEP_TITLES[11]}
        onContinue={() => router.push("/questionnaire?step=12")}
      />
    </>
  );
}
