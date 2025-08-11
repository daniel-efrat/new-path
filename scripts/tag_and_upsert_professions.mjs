import fs from "fs/promises";
import path from "path";
import process from "process";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

/**
 * הגדרות
 * - EDIT_ME: עדכן/הרחב מילות מפתח לפי הצורך, בעברית.
 * - המשקלים מגדירים כמה כל שדה משפיע (title/field/description).
 */
const FIELD_WEIGHTS = {
  title: 3,
  field: 2,
  description: 1,
};

// RIASEC order + מפתח קבוע לוקטור
const ORDER = ["R", "I", "A", "S", "E", "C"];

/** כללי מילות־מפתח (Hebrew) — ערוך חופשי */
const RULES = {
  R: [
    "תחזוקה",
    "מכונ",
    "טכני",
    "מכונות",
    "כלים",
    "נהיגה",
    "שטח",
    "בנייה",
    "חקלא",
    "אגרו",
    "נגר",
    "רתך",
    "תפעול ציוד",
    "מעשי",
    "מחסן",
    "לוגיסט",
  ],
  I: [
    "מחקר",
    "ניתוח",
    "ניסוי",
    "נתונ",
    "סטטיסט",
    "מדע",
    "הנדס",
    "אקדמי",
    "מעבדה",
    "אלגוריתם",
    "פתרון בעיות",
    "חישוב",
    "בדיקה מדעית",
  ],
  A: [
    "עיצוב",
    "יציר",
    "קריאטיב",
    "כתיב",
    "עריכ",
    "וידאו",
    "איור",
    "מוזיקה",
    "אמנות",
    "תוכן",
    "UX",
    "UI",
    "קופירייט",
    "תסריט",
  ],
  S: [
    "הוראה",
    "הדרכ",
    "ייעוץ",
    "טיפול",
    "שירות",
    "קהילה",
    "תמיכה",
    "אבחון",
    "חונכות",
    "סוציאל",
    "פסיכולוג",
    "לקוחות",
    "עזרה",
    "סיעוד",
  ],
  E: [
    "מכירות",
    "שיווק",
    "ניהול",
    "מנהלה",
    "הובלה עסקית",
    "גיוס",
    "יזמ",
    "פיתוח עסקי",
    "תפעול מסחרי",
    "שותפויות",
    "משא ומתן",
  ],
  C: [
    "אדמיניסטר",
    "רישומ",
    "רגולציה",
    "חשבונ",
    "תפעול משרדי",
    "מזכירות",
    "סדר",
    "נהלים",
    "תיעוד",
    "גבייה",
    "בק אופיס",
    "קלרקל",
  ],
};

/** הגדרות CLI ברירת מחדל */
const DEFAULTS = {
  input: "./professions.json",
  out: "./professions_tagged.json",
  dryRun: true, // true = לא שולח לסופבייס, רק יוצר קובץ פלט
  topKCode: 3, // כמה אותיות לקוד (בד"כ 3)
  maxUpsertBatch: 500, // שמור על באצ'ים
};

/** חיפוש סכמטי של תתי-מחרוזות (עברית) - לא רגיש רישיות */
function countOccurrences(text, needle) {
  if (!text || !needle) return 0;
  const t = String(text).toLowerCase();
  const n = String(needle).toLowerCase();
  // חיפוש "כולל" (תת־מחרוזת), לא מילה שלמה – עובד טוב לעברית מוטה־שורש
  let idx = 0,
    c = 0;
  while ((idx = t.indexOf(n, idx)) !== -1) {
    c += 1;
    idx += n.length;
  }
  return c;
}

/** סכימת ניקוד לפי כללי המילים והשדה */
function scoreJob(job) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const type of ORDER) {
    const needles = RULES[type];
    for (const needle of needles) {
      // משקל לפי שדות שונים
      scores[type] += FIELD_WEIGHTS.title * countOccurrences(job.title, needle);
      scores[type] += FIELD_WEIGHTS.field * countOccurrences(job.field, needle);
      scores[type] +=
        FIELD_WEIGHTS.description * countOccurrences(job.description, needle);
    }
  }

  return scores;
}

/** החלקה קלה + המרה לוקטור [R,I,A,S,E,C] */
function scoresToVector(scores) {
  const vec = ORDER.map((k) => scores[k] || 0);

  // אם הכול 0 (לא נמצאו מילות מפתח), החזר וקטור אפס ונשען על override אם יש
  const sum = vec.reduce((s, v) => s + v, 0);
  if (sum === 0) return vec;

  // נורמליזציה לסולם 0..5
  const max = Math.max(...vec);
  return vec.map((v) => (max ? +((v / max) * 5).toFixed(2) : 0));
}

/** הפקת קוד לפי top K */
function vectorToCode(vec, k = 3) {
  const pairs = ORDER.map((k2, i) => ({ k: k2, v: vec[i] }));
  pairs.sort((a, b) => b.v - a.v);
  const top = pairs.slice(0, k);
  // אם יש שוויון מוחלט (הכול 0), החזר מחרוזת ריקה
  if (top.every((p) => p.v === 0)) return "";
  return top.map((p) => p.k).join("");
}

/** מיזוג עדיפויות: אם יש override ידני—נכבד אותו */
function applyOverrides(job, vec, autoCode, topKCode) {
  // אפשר לתת במקור:
  // riasec_override_code: "ISA"
  // riasec_override_vector: [..]
  if (
    Array.isArray(job.riasec_override_vector) &&
    job.riasec_override_vector.length === 6
  ) {
    return {
      vector: job.riasec_override_vector.map(Number),
      code:
        vectorToCode(job.riasec_override_vector.map(Number), topKCode) ||
        job.riasec_override_code ||
        autoCode,
      source: "override_vector",
    };
  }

  if (
    typeof job.riasec_override_code === "string" &&
    job.riasec_override_code.trim()
  ) {
    const code = job.riasec_override_code.trim().toUpperCase();
    // הפוך קוד לוקטור גס: 5 לטופ1, 3 לטופ2, 2 לטופ3, 0 לאחרים
    const weightsByRank = [5, 3, 2];
    const base = new Array(6).fill(0);
    for (let i = 0; i < Math.min(code.length, 3); i++) {
      const idx = ORDER.indexOf(code[i]);
      if (idx >= 0) base[idx] = weightsByRank[i];
    }
    return { vector: base, code, source: "override_code" };
  }

  return { vector: vec, code: autoCode, source: "auto" };
}

/** Upsert batched ל-Supabase */
async function upsertToSupabase(rows, onConflict) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env."
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const chunks = [];
  for (let i = 0; i < rows.length; i += DEFAULTS.maxUpsertBatch) {
    chunks.push(rows.slice(i, i + DEFAULTS.maxUpsertBatch));
  }

  for (const [idx, chunk] of chunks.entries()) {
    const { data, error } = await supabase
      .from("professions")
      .upsert(chunk, { onConflict, ignoreDuplicates: false });

    if (error) {
      console.error(
        `Upsert batch ${idx + 1}/${chunks.length} failed:`,
        error.message
      );
      throw error;
    }
    console.log(
      `Upsert batch ${idx + 1}/${chunks.length}: ${data?.length ?? 0} rows`
    );
  }
}

/** main */
async function main() {
  // CLI:
  // node tag_and_upsert_professions.mjs --in=./professions.json --out=./professions_tagged.json --commit --conflict=title,field --topk=3
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    })
  );

  const input = args.in || args.input || DEFAULTS.input;
  const out = args.out || DEFAULTS.out;
  const dryRun = !(args.commit || args.upsert); // ברירת מחדל: dry run
  const onConflict = args.conflict || "title,field"; // חייב להתאים ל-unique index שלך
  const topKCode = parseInt(args.topk || DEFAULTS.topKCode, 10);

  const raw = await fs.readFile(path.resolve(input), "utf8");
  const list = JSON.parse(raw);

  if (!Array.isArray(list)) {
    throw new Error("Input JSON must be an array of professions.");
  }

  const enriched = list.map((job) => {
    const scores = scoreJob(job);
    const vectorAuto = scoresToVector(scores);
    const autoCode = vectorToCode(vectorAuto, topKCode);
    const merged = applyOverrides(job, vectorAuto, autoCode, topKCode);

    return {
      ...job,
      riasec_code: merged.code || autoCode || null,
      riasec_vector: merged.vector,
      riasec_source: merged.source, // "auto" | "override_code" | "override_vector"
    };
  });

  // כתיבת פלט לאימות
  await fs.writeFile(
    path.resolve(out),
    JSON.stringify(enriched, null, 2),
    "utf8"
  );
  console.log(`Wrote tagged JSON → ${out}`);

  // Upsert (לא חובה)
  if (!dryRun) {
    // הכן שדות לשולחן—נניח שיש עמודות: title, field, description, salary, riasec_code, riasec_vector
    const rows = enriched.map((j) => ({
      title: j.title,
      field: j.field ?? null,
      description: j.description ?? null,
      salary: j.salary ?? null,
      riasec_code: j.riasec_code,
      riasec_vector: j.riasec_vector,
    }));

    console.log(
      `Upserting ${rows.length} rows to Supabase (onConflict=${onConflict})...`
    );
    await upsertToSupabase(rows, onConflict);
    console.log("Done.");
  } else {
    console.log("Dry run complete (no DB changes). Use --commit to upsert.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
