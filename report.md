# UX QA Report: דרך חדשה (New Path)

**Target:** https://new-path-test.vercel.app
**Date:** May 30, 2026
**Test Account:** hermes-mail-1@agentmail.to
**Password:** o4udgbBN7bGmUmwVDT7F8Q==
**Tester:** Hermes Agent (UX QA)
**Testing Scope:** Landing page, login, dashboard, Holland questionnaire (partial), profile/results, navigation

---

## Executive Summary

### Overall Grade: C+

| Dimension | Grade | Notes |
|-----------|-------|-------|
| First Impression | B+ | Clean, professional landing page with clear Hebrew RTL support |
| Signup/Login Flow | B | Minimal, functional — but OAuth only option is Google |
| Dashboard | B | Clear card layout, progress tracking visible |
| Holland Questionnaire | D+ | Critical bugs: no validation, no progress save, 2-click per question |
| Error Handling | D | Silent failures, no validation on skip, DB constraint violation |
| Visual Design | B | Clean, modern, good RTL support, large touch targets |
| Accessibility | C | No ARIA labels visible, subtle selection feedback, keyboard hints present |

### Bug Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 3 |
| 🟡 Medium | 3 |
| 🔵 Low | 2 |
| **Total** | **10** |

### Verdict

דרך חדשה has a solid foundation — clean visual design, good Hebrew RTL support, and a well-structured assessment flow. However, the current build has critical issues in the Holland questionnaire that would corrupt assessment results (silent question skipping) and cause massive user frustration (no progress persistence on navigation). The app is NOT production-ready for the full 13-section assessment in its current state. The bugs in the questionnaire flow — particularly the lack of validation and progress saving — are showstoppers for a psychometric tool where data integrity is paramount.

The good news: the visual design, responsive layout, and overall information architecture are solid. The critical bugs are fixable and don't require redesign — just implementation of standard patterns (validation, auto-save, selection feedback).

---

## Step-by-Step User Journey

### Step 1: Landing Page

**URL:** https://new-path-test.vercel.app

**UX Analysis:**
- **First impression:** Professional, clean, modern. The Hebrew text renders correctly with proper RTL.
- **Value proposition:** "מה הדרך שלך?" (What's your path?) — clear career discovery angle. Subtitle explains "smart diagnosis in minutes."
- **Visual hierarchy:** Hero heading dominates → CTA button → feature cards below. Eye flows naturally.
- **Trust signals:** "10,000+ assessments completed", "95% satisfaction", "50+ partner colleges" — solid social proof.
- **CTA clarity:** Two "התחל אבחון" buttons (hero and bottom) — clear, consistent, action-oriented.
- **Footer:** Privacy policy, terms, contact, about the questionnaire — all links present.
- **"Why choose us?"** section emphasizes Israeli-market specificity — good localization.
- **Reassurance text:** "No commitment, cancel anytime, immediate results" — reduces signup anxiety.

**Console:** Clean — only expected OAuth token checks, no JS errors.

**Bugs found:** None.

---

### Step 2: Login Page

**URL:** /login (SPA route)

**UX Analysis:**
- **Clarity:** "התחבר לחשבונך" (Login to your account) — clear heading with helpful subtitle.
- **Fields:** Email + password, both marked required. Minimal — just 2 fields.
- **Forgot password:** Link present — good.
- **Social login:** Google OAuth only. No GitHub, Apple, or Microsoft options.
- **Divider:** Clean "או" (or) separator between credentials and OAuth.
- **Signup link:** "אין לך חשבון? הירשם" (No account? Sign up) — present and clear.
- **Form validation:** Not tested in this audit (account already existed).

**Console:** Clean — no errors during login.

**Bugs found:** None.

---

### Step 3: Dashboard

**URL:** /dashboard

**UX Analysis:**
- **Clarity:** "שאלון הערכה מקצועית" (Professional Assessment Questionnaire) — clear title. "Complete all steps to get personalized recommendations."
- **Progress:** "2 out of 13 steps completed — 15%" with progress bar. Good at-a-glance status.
- **Layout:** Card grid — Phase A (4 sections) and Phase B (9 sections) clearly separated with headers.
- **Card design:** Each card shows section name, description, question count, and status. Completed cards have green "הושלם" badge and "תוצאות" button.
- **Affordance:** Cards have cursor:pointer and clickable styling.
- **Empty state handling:** Phase B cards show descriptions but no start buttons — presumably unlock after Phase A completion.
- **CTA:** "סיים ושלח שאלון" (Finish and Submit) — properly disabled until all sections complete.
- **Profile menu:** Shows email, "Profile & Results" link, and "Logout". Clean and minimal.

**Console:** DB error visible: `Failed to save answer to database: code "23503"` — foreign key constraint on answers_question_id_fkey. This means some answers reference question IDs that don't exist in the questions table.

**Bugs found:**
- **BUG #1 [CRITICAL]:** Database constraint violation — `insert or update on table "answers" violates foreign key constraint "answers_question_id_fkey"`. Key not present in table "questions". This will cause data integrity issues.
- **BUG #2 [LOW]:** Dashboard says "7 חכמות" in the landing page feature section but the actual assessment is 13 sections — inconsistency.

---

### Step 4: Holland Questionnaire — Intro Screens

**URL:** /holland (two intro screens before Q1)

**UX Analysis — Screen 1 ("איך זה עובד"):**
- **Content:** Brief explanation + 5 rating buttons displayed as a preview.
- **Rating scale:** "אוהב מאוד" → "לא אוהב בכלל" with icons — great visual preview.
- **CTA:** "ועוד דבר אחד חשוב" (And one more important thing) — **vague and misleading.** Reads like there's more info, not that this is the start button. Should be "התחל" or "בוא נתחיל".
- **Issue:** The rating buttons on this intro screen look interactive but appear to be illustrative only.

**UX Analysis — Screen 2 ("כשאתם עונים על השאלון"):**
- **Content:** Guidance on how to answer (no right/wrong answers, be authentic).
- **CTA:** "בוא נתחיל" (Let's start) — clear and action-oriented.
- **Friction:** Two intro screens before Q1 = 3 clicks before the first real interaction.

**Bugs found:**
- **BUG #3 [MEDIUM]:** Two intro screens for a 60-question assessment is excessive friction. Should be combined into one screen or a dismissable overlay.
- **BUG #4 [LOW]:** "ועוד דבר אחד חשוב" is an unclear CTA — doesn't communicate "start" or "begin."

---

### Step 5: Holland Questionnaire — Question Flow

**URL:** /holland/questions (Q1-Q60)

**UX Analysis:**
- **Layout:** Clean — question number ("שאלה X / 60"), statement text, 5 rating buttons, "שאלה הבאה" button.
- **Buttons:** Large, touch-friendly, with both icon and text. Good for mobile and desktop.
- **Question text:** Clear and readable, though slightly small compared to the massive rating buttons.
- **Scale:** 5-point Likert — appropriate for Holland assessment.
- **Progress indicator:** Text-only "שאלה X / 60" — no visual progress bar. For a 60-question assessment, a progress bar is standard for user motivation.

**Bugs found:**
- **BUG #5 [CRITICAL]:** **Silent question skip** — clicking "שאלה הבאה" without selecting an answer advances to the next question with NO validation, NO warning, NO toast. Q3 was silently skipped during testing. This corrupts the Holland code calculation. In a psychometric assessment, this is a critical data integrity bug.
- **BUG #6 [HIGH]:** **No selection visibility feedback** — clicking a rating button produces extremely subtle visual feedback (border-primary + ring-2 on the DOM). Users cannot easily tell which answer they selected. Industry standard (Typeform, Google Forms) uses bold fill + checkmark. This causes uncertainty and double-clicking.
- **BUG #7 [HIGH]:** **No mid-section progress persistence** — using browser back, clicking the logo, or navigating away loses ALL Holland progress. Re-entering shows the intro screen again. Dashboard still shows "2/13" — no partial save. Accidental navigation = restart 60 questions from scratch.
- **BUG #8 [MEDIUM]:** **No "Previous Question" button** — users cannot go back to review or change answers. Forward-only navigation with no undo.
- **BUG #9 [MEDIUM]:** **Two-click per question** — select rating + click "Next" = 120 clicks for 60 questions. Industry standard is single-click with auto-advance (Typeform, Google Forms).

---

### Step 6: Profile & Results Page

**URL:** /profile

**UX Analysis:**
- **Layout:** Two cards — "Initial Direction Map" and "Career Diagnostic Report."
- **State:** Both show "טרם נוצר" (Not yet created) — correct empty state for incomplete assessment.
- **Description:** Each card explains what the report contains and when it's generated.
- **CTA:** "פתח ליצירת תוצאות" (Open to create results) — manual generation. Results are not auto-generated.
- **Back navigation:** "חזרה ללוח הבקרה" (Back to Dashboard) button present.
- **Issue:** Results require manual generation — users might expect auto-generated results after completing sections.

**Bugs found:** None.

---

### Step 7: Core Traits — "Results" (Review Page)

**URL:** /dashboard/step/1

**UX Analysis:**
- **Misleading label:** The dashboard button says "תוצאות" (Results) but opens an edit/review page, not actual computed results. Users expecting insights get a form.
- **Progress:** "100% מהשאלון הושלם" (100% of questionnaire completed) — clear.
- **Selection count:** "10 out of 10 possible traits selected" — helpful summary.
- **Keyboard navigation hint:** "Arrow up/down for navigation, SPACE to select" — good accessibility touch.
- **Trait list:** ~75 checkboxes with 10 selected — clear display of choices.

**Bugs found:**
- **BUG #10 [HIGH]:** **Duplicate trait** — "יכולת הקשבה" (listening ability) appears twice in the trait list (positions 17 and 57). Data duplication in the survey content.

---

## Navigation & State Management Issues

### Logo Click Behavior
Clicking the logo from within the Holland questionnaire navigates to the **landing page**, not the dashboard. Authenticated users expect logo → dashboard. This is confusing and contributed to progress loss (BUG #7).

### Browser Back Button
In the SPA, browser back from the Holland questionnaire goes to `/dashboard` — losing all in-progress answers. The app should either:
1. Save progress on navigation, OR
2. Show a "you have unsaved changes" warning dialog, OR
3. Use URL-based state (e.g., `/holland?q=5`) so browser back returns to the correct question.

### No "Save and Continue Later"
There is no mechanism to save partial progress in any section. Users who need to pause mid-assessment (60 questions!) must either finish or lose all progress. This is a significant UX gap for a long-form assessment.

---

## Console Error Log

```
[ERROR] Failed to save answer to database: {
  code: "23503",
  message: "insert or update on table "answers" violates foreign key constraint "answers_question_id_fkey"",
  details: "Key is not present in table "questions".",
  hint: null
}
```

This is a database integrity error — answers are being saved with question IDs that don't exist in the questions table. This likely affects result calculation and data reliability.

---

## Summary

### What's Great
1. **Clean, modern visual design** — professional look with good color palette and typography
2. **Excellent Hebrew RTL support** — text flows correctly, UI elements mirror properly
3. **Clear assessment structure** — 13 well-defined sections across two phases
4. **Good landing page** — strong value proposition, trust signals, clear CTAs
5. **Minimal login form** — just email + password with Google OAuth backup
6. **Dashboard overview** — progress bar, section cards, clear status indicators

### What Needs Work
1. **Questionnaire validation** — must prevent silent skips (CRITICAL)
2. **Selection feedback** — need visible, obvious selection state on rating buttons
3. **Progress persistence** — auto-save per question, not per section
4. **Navigation** — add back button, warn on exit, logo goes to dashboard
5. **Question efficiency** — auto-advance after selection to halve click count
6. **Button labeling** — "ועוד דבר אחד חשוב" → "התחל", "תוצאות" → "ערוך/צפה"
7. **Duplicate content** — fix the double "יכולת הקשבה" trait
8. **Database integrity** — fix foreign key constraint violation

### Recommendations

1. **Add required-answer validation before advancing** — block "שאלה הבאה" with a toast "יש לבחור תשובה לפני המעבר לשאלה הבאה" until a rating is selected. This is the highest-priority fix.

2. **Implement auto-advance on selection** — after clicking a rating, auto-advance to the next question after a 300ms delay. Add an "undo" button or keep "Previous Question" for corrections. This eliminates 50% of clicks.

3. **Add per-question progress persistence** — save each answer to the backend immediately after selection (optimistic update). On re-entry, resume from the last answered question, not the intro screen.

4. **Improve selection feedback** — use a filled background color (primary) + white text + checkmark icon on the selected button. The current border-primary + ring-2 is too subtle.

5. **Combine intro screens** — merge into a single overlay with "איך זה עובד" on top and "בוא נתחיל" CTA. Consider skipping intro entirely for users who return after losing progress.

6. **Fix navigation from in-section** — logo should go to dashboard for authenticated users. Add a browser-back confirmation dialog.

7. **Fix the database constraint violation** — the `answers_question_id_fkey` error suggests a mismatch between answer submissions and the questions table. Audit the seed data.

8. **Fix duplicate trait** — remove the second instance of "יכולת הקשבה" from the Core Traits list.

9. **Add a visual progress bar** — replace or supplement the text "שאלה X / 60" with a thin progress bar at the top of the question screen.

10. **Rename "תוצאות" to "עריכה/צפייה"** — the button on completed sections opens edit/review, not computed results. The label is misleading.

---

## Appendix

- **Test account:** hermes-mail-1@agentmail.to
- **Sections completed:** Core Traits, Career Anchors
- **Sections partially tested:** Holland Questionnaire (Q1-Q4 observed, progress lost)
- **Sections not tested:** Purpose Statements, all Phase B sections (Hebrew, English, Logic, Math, Visual Shapes, Computer Knowledge, Attention/Memory, Personality, Personal Values)
- **Browser environment:** Browserbase (stealth mode, no residential proxy)
- **Console log saved:** See console output throughout report
