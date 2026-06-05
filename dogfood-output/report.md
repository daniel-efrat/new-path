# Dogfood QA Report

**Target:** http://127.0.0.1:3000
**Project:** `/Users/daniel/Desktop/code/new-path`
**Date:** 2026-06-05 09:56:07 CEST
**Scope:** Exploratory audit of the Next.js app: public landing page, auth screens, contact page, questionnaire entry/step 1, legal/footer pages, 404 behavior, console output, and build/lint/type checks.
**Tester:** Hermes Agent (automated exploratory QA)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 0 |
| 🟡 Medium | 3 |
| 🔵 Low | 3 |
| **Total** | **6** |

**Overall Assessment:** The app builds and the main public/auth/questionnaire routes render, but the audit found several UX/accessibility/content issues plus build/runtime warnings that should be cleaned up before production hardening.

### Verification performed

- `npm run typecheck` — passed.
- `npm run build` — passed with warnings.
- `npm run lint` — passed with warnings.
- Dev server started on required port 3000 via `npm run dev` after checking/killing existing port occupants per `AGENTS.md`.
- Route smoke test:
  - `/` → 200
  - `/dashboard` → 200
  - `/signin` → 200
  - `/signup` → 200
  - `/contact` → 200
  - `/questionnaire` → 200
  - `/privacy` → 200
  - `/terms` → 200
  - `/accessibility` → 200
  - `/definitely-missing` → 404

---

## Issues

### Issue #1: Invalid login logs an `AuthApiError` into the console / Next dev overlay

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Console / UX |
| **URL** | `http://127.0.0.1:3000/signin` and `http://127.0.0.1:3000/dashboard` unauthenticated login form |

**Description:**
Submitting invalid credentials shows a user-facing Hebrew error, which is good, but the underlying `AuthApiError: Invalid login credentials` is also surfaced in the Next.js dev issues overlay as a console issue. In development this creates a red “1 Issue” badge and overlay. In production, the user-facing behavior may be fine, but auth failures should normally be handled as expected validation failures rather than reported as console errors.

**Steps to Reproduce:**
1. Navigate to `/signin` or unauthenticated `/dashboard`.
2. Enter `qa@example.com` and `wrongpassword123`.
3. Submit the login form.
4. Observe the visible error and open the Next dev issues badge.

**Expected Behavior:**
Invalid credentials should produce a normal inline user-facing error without logging an expected auth failure as a console error.

**Actual Behavior:**
Inline error appears, but Next dev overlay reports:

```text
Console AuthApiError
Invalid login credentials
app/signin/SigninPageClient.tsx (128:31) @ async handleSubmit
```

**Evidence:**
MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_2bf6fe7346ca4d778266e484828c543f.png

**Recommended Fix:**
Handle Supabase invalid credential errors without `console.error` for expected failures. Reserve console errors for unexpected exceptions. For example, detect known auth error statuses/messages and only call `setError(...)`.

---

### Issue #2: Signup consent checkbox rows are visually cramped and hard to interact with in RTL layout

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Accessibility / UX / Visual |
| **URL** | `http://127.0.0.1:3000/signup` |

**Description:**
The signup form consent rows are small and visually cramped. The standalone Hebrew preposition before the linked text (`ל תנאי השימוש`, `ל מדיניות הפרטיות`) looks awkward in RTL layout. The checkbox boxes themselves are only about 16×16px, which is below comfortable touch target size.

During testing, one checkbox was also difficult to toggle via browser automation, while programmatic click worked. This may be an automation artifact, but it reinforces that the hit target is small and worth improving.

**Steps to Reproduce:**
1. Navigate to `/signup`.
2. Inspect the terms/privacy consent rows.
3. Try interacting with the checkbox squares and row labels.

**Expected Behavior:**
Consent rows should be easy to read and easy to tap/click, with a large target area and natural Hebrew RTL sentence flow.

**Actual Behavior:**
Rows look cramped, the checkbox target is small, and the link placement reads awkwardly in Hebrew.

**Evidence:**
MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_cf4d987f74244f0ebd257390a52b2332.png

**Recommended Fix:**
- Make each consent row a larger clickable block, ideally with at least ~44px height.
- Keep the full sentence readable in Hebrew; consider making “תנאי השימוש” / “מדיניות הפרטיות” part of a single, well-spaced inline phrase.
- Consider `unicode-bidi: isolate` / `<bdi>` around inline links if bidi ordering becomes inconsistent.

---

### Issue #3: Questionnaire Step 1 progress/status wording is misleading

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | UX / Content |
| **URL** | `http://127.0.0.1:3000/questionnaire` |

**Description:**
On Step 1, selecting 3 traits shows progress/status text that can be interpreted as overall questionnaire completion. The DOM snapshot showed `38% מהשאלון הושלם` after selecting 3 of 8 possible traits. The UI also shows a success message (`✓ כל הנתונים הוזנו בהצלחה`) and enables “continue” after partial selection.

If “up to 8 traits” is intentional, enabling continuation after 1+ selections may be valid. The issue is the wording: 3/8 traits is not 38% of the full questionnaire; it is only 38% of the optional trait-selection capacity. This can mislead users about their overall progress.

**Steps to Reproduce:**
1. Navigate to `/questionnaire`.
2. Dismiss the Gilbert intro modal.
3. Select three traits.
4. Observe progress/status messaging.

**Expected Behavior:**
Progress text should distinguish between selection capacity and full questionnaire progress, e.g. “בחרת 3 מתוך 8 תכונות אפשריות” without calling it questionnaire completion.

**Actual Behavior:**
Step-level selection count is presented as questionnaire completion percentage, and a broad success message appears after partial trait selection.

**Evidence:**
MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_329f6a0b3a0e4946b7bf2d6fd40ae483.png

**Recommended Fix:**
- Replace `38% מהשאלון הושלם` on Step 1 with text like `בחרת 3 מתוך 8 תכונות אפשריות`.
- If a minimum is enough to continue, change `כל הנתונים הוזנו בהצלחה` to a less absolute message such as `אפשר להמשיך, או לבחור עד 8 תכונות`.

Relevant code observed:

```tsx
// components/questionnaire/steps/Step1.tsx
const totalProgress = Math.min(
  Math.round((traitsCount / maxTraits) * 100),
  100
);
...
{totalProgress}% מהשאלון הושלם
```

---

### Issue #4: Build emits Edge Runtime warnings for Supabase packages used through middleware

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Console / Build / Functional Risk |
| **URL** | Build-time issue; relevant to `middleware.ts` and auth/session behavior |

**Description:**
`npm run build` succeeds, but emits repeated warnings that Supabase packages reference Node.js APIs unsupported in the Edge Runtime. The import trace points through `@supabase/ssr` / `@supabase/supabase-js` and `middleware.ts`.

**Steps to Reproduce:**
1. Run `npm run build`.
2. Inspect build warnings.

**Expected Behavior:**
Production build should be warning-free, especially for middleware running in Edge Runtime.

**Actual Behavior:**
Warnings include:

```text
./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
A Node.js API is used (process.versions at line: 11) which is not supported in the Edge Runtime.
...
Import trace:
./node_modules/@supabase/supabase-js/dist/module/index.js
./node_modules/@supabase/ssr/dist/module/createServerClient.js
./node_modules/@supabase/ssr/dist/module/index.js
```

Also:

```text
Critical dependency: the request of a dependency is an expression
Import trace:
./node_modules/@supabase/supabase-js/dist/module/index.js
./app/api/seed/route.ts
```

**Evidence:**
Build command output in this audit session.

**Recommended Fix:**
- Confirm the current Supabase SSR middleware pattern is compatible with Next 15 Edge middleware.
- Consider updating Supabase packages if newer versions reduce these warnings.
- Keep server-only Supabase admin/seed imports out of middleware/edge bundles.
- If middleware does not need `getSession()` on every matched route, simplify/remove the middleware to avoid bundling Supabase there.

---

### Issue #5: 404 page is not localized and lacks a recovery action

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Content / UX |
| **URL** | `http://127.0.0.1:3000/definitely-missing` |

**Description:**
The app shell is Hebrew/RTL and branded, but the core 404 content is the default English text: “This page could not be found.” There is no prominent Hebrew recovery CTA back to the homepage/dashboard.

**Steps to Reproduce:**
1. Navigate to a missing route, e.g. `/definitely-missing`.
2. Observe the 404 content.

**Expected Behavior:**
A Hebrew RTL 404 page with a clear explanation and recovery action, e.g. `העמוד לא נמצא` and a button back to homepage.

**Actual Behavior:**
Default English 404 text appears inside an otherwise Hebrew site shell.

**Evidence:**
MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_e384e596072f49909a8630a1c9038ece.png

**Recommended Fix:**
Add a top-level `app/not-found.tsx` with localized Hebrew copy and a clear CTA.

---

### Issue #6: Accessibility statement still contains placeholder contact details

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Content / Accessibility |
| **URL** | `http://127.0.0.1:3000/accessibility` |

**Description:**
The accessibility statement includes placeholder text indicating that dedicated accessibility contact details still need completion.

Observed source text:

```text
פרטי קשר ייעודיים: להשלמה
```

and:

```text
בשלב זה פרטי רכז/ת הנגישות ופרטי קשר ייעודיים יושלמו על ידי בעל האתר...
```

**Steps to Reproduce:**
1. Navigate to `/accessibility`.
2. Read the “פנייה בנושא נגישות” section.

**Expected Behavior:**
Accessibility page should provide concrete contact details for accessibility issues before release.

**Actual Behavior:**
Placeholder `להשלמה` remains in the content.

**Evidence:**
Source inspected at `app/accessibility/page.tsx`, lines 160–168.

**Recommended Fix:**
Replace placeholders with the actual accessibility coordinator/contact channel, or link directly to the contact page with explicit instructions.

---

## Additional Observations

### Lint warnings are numerous but non-blocking

`npm run lint` exits successfully but reports many warnings, including:

- Unused variables/imports in questionnaire components and validators.
- Missing React hook dependencies in several questionnaire step components.
- Multiple `<img>` usage warnings where `next/image` is recommended.

These are not immediate blockers, but the hook dependency warnings in timed/questionnaire steps deserve review because stale closures can cause subtle timer/progression bugs.

### Homepage and contact page render well overall

No console errors were observed on initial homepage/contact navigation. The homepage is visually polished and RTL layout is mostly good. The contact page layout is clear and the form uses visible labels.

### Contact page validation

Empty contact form submission is stopped by native required-field validation. No custom validation issue was confirmed during this audit.

### Sign-up validation

Password mismatch validation works when the form submits; the form displays `הסיסמאות אינן תואמות`. The main issue is the consent row layout/tap target, not the mismatch validation itself.

---

## Testing Coverage

### Pages Tested

- `/`
- `/dashboard` unauthenticated state
- `/signin`
- `/signup`
- `/contact`
- `/questionnaire`
- `/privacy`
- `/terms`
- `/accessibility`
- `/definitely-missing`

### Features Tested

- Homepage visual layout and CTA targets.
- Auth form empty/invalid credential behavior.
- Signup form layout, consent rows, and validation behavior.
- Contact page layout and empty-submit required validation.
- Questionnaire intro modal and Step 1 trait selection.
- 404 route handling.
- Console checks after key navigations/interactions.
- Typecheck/build/lint route smoke checks.

### Not Tested / Out of Scope

- Real account signup with email verification.
- Google OAuth end-to-end.
- Authenticated dashboard and full questionnaire completion.
- Supabase persistence correctness across real users.
- Mobile viewport/responsive audit.
- Full accessibility audit with screen reader or automated WCAG tooling.

### Blockers

- No real authenticated test user was provided, so authenticated dashboard/results flows were not audited end-to-end.

---

## Screenshots Referenced

- Homepage: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_fcc8a9dcbe274cde82b73a82c7676ae6.png
- Login invalid credentials: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_2bf6fe7346ca4d778266e484828c543f.png
- Signup layout: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_cf4d987f74244f0ebd257390a52b2332.png
- Signup validation test: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_5548bffc8dc8484eaf2ac58fe2f778a4.png
- Contact page: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_7ec6e4f7984948a4ab7d3db82b36514f.png
- Questionnaire intro: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_e45054b5a8724a2da28d4462f4afb64e.png
- Questionnaire Step 1: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_329f6a0b3a0e4946b7bf2d6fd40ae483.png
- 404 page: MEDIA:/Users/daniel/.hermes/cache/screenshots/browser_screenshot_e384e596072f49909a8630a1c9038ece.png
