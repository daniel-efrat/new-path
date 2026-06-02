# New Path Accessibility Audit

Audit date: 2026-06-02  
Target tested: https://new-path-test.vercel.app  
Standard reference: WCAG 2.x Level AA / Israeli Standard 5568 mapping  
Note: This is a technical accessibility audit, not legal advice.

## A. Executive Summary

Overall status: partially compliant, with several practical WCAG AA risks found on public and auth screens. The app has a strong RTL foundation (`lang="he"` and `dir="rtl"`), visible labels on auth forms, visible keyboard focus CSS, and mostly semantic page structure on the home/privacy pages.

Main risks:

- Public CTAs used nested interactive elements (`a > button`), causing duplicate focus stops and invalid semantics. Fixed locally.
- Login/register pages lacked page-level `h1`s and deployed with a generic document title. Fixed locally with visible `h1`s and client-side titles.
- Form error states were not announced or connected to inputs. Fixed locally for sign-in/sign-up.
- The Holland page had two visible `h1`s. Fixed locally.
- No accessibility statement route/link is visible in the footer. Not fixed; requires owner/legal details.
- Authenticated dashboard/questionnaire flows were only partially reachable because no test credentials were provided and the local dev server could not be restarted on port 3000 due a sandbox-protected existing listener.

Highest-priority next fixes:

1. Add an accessibility statement page and footer link.
2. Finish authenticated keyboard/form testing with a test account.
3. Replace `href="#"` forgot-password placeholder with a real reset flow or remove it.
4. Add route-level metadata for auth pages using a server wrapper, rather than only client-side `document.title`.

## B. Tested Pages/Routes

| Route | Automated/static | Browser/DOM | Manual keyboard-oriented | Notes |
| --- | --- | --- | --- | --- |
| `/` | ESLint, typecheck, build, source review | Yes | Focus order inferred from focusable DOM | Deployed page showed duplicate CTA focus targets; fixed locally. |
| `/signin` | ESLint, typecheck, build, source review | Yes | Form/focusability inspected | Missing `h1`, generic title, non-announced errors; fixed locally. |
| `/signup` | ESLint, typecheck, build, source review | Yes | Form/focusability inspected | Missing `h1`, generic title, non-announced errors; fixed locally. |
| `/aboutHolland` | ESLint, typecheck, build, source review | Yes | Buttons/dialog semantics inspected | Two `h1`s and nested CTA; fixed locally. |
| `/privacy` | Source review + DOM inspection | Yes | Basic link/focusability inspected | Structure looked reasonable; no accessibility statement link found elsewhere. |
| `/dashboard` | Redirect behavior checked | Partial | Not fully tested | Redirected to sign-in without credentials. |
| Questionnaire/report routes | Source review only | Not fully | Not fully | Requires authenticated/test data flow. |

## C. Issues Table

| Severity | Area/page | Issue | WCAG/Israeli relevance | Evidence | Recommended fix | Status |
| --- | --- | --- | --- | --- | --- | --- |
| High | Home CTAs | Link wrapped a button, creating invalid nested interactive controls and duplicate tab stops. | 2.1.1 Keyboard, 4.1.2 Name/Role/Value | Live DOM exposed both `A /dashboard` and nested `BUTTON` for the same CTA. | Use `Button asChild` with `Link` as the single interactive element. | Fixed |
| High | About Holland CTA | Same nested `a > button` pattern. | 2.1.1, 4.1.2 | Source: `app/aboutHolland/page.tsx`. | Use `Button asChild` with `Link`. | Fixed |
| Medium | Sign-in/sign-up | No visible page-level `h1`; deployed title was generic `דרך חדשה`. | 2.4.2 Page Titled, 2.4.6 Headings and Labels | DOM audit: `h1s: []` on `/signin` and `/signup`. | Add visible `h1`; set descriptive page title. | Fixed locally |
| Medium | About Holland | Two visible `h1`s on one page. | 1.3.1 Info and Relationships, 2.4.6 | DOM audit found `שאלון הולנד...` and `מצאו את הכיוון...` as `h1`s. | Keep one `h1`, make the second visual headline non-heading text or `h2`. | Fixed |
| Medium | Auth forms | Error messages were not announced and not connected to fields; sign-in used `alert()`. | 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.3 Status Messages | Source: `app/signin/page.tsx`, `app/signup/page.tsx`. | Render errors with `role="alert"`, connect via `aria-describedby`, set `aria-invalid`. | Fixed locally |
| Medium | Auth forms | Missing useful autocomplete attributes on email/name/new-password fields. | 1.3.5 Identify Input Purpose | DOM audit showed `autocomplete: null` for several fields. | Add `autocomplete="email"`, `name`, `new-password`. | Fixed |
| Medium | Footer/legal | No accessibility statement link/page visible. | Israeli practical compliance item; WCAG support documentation | Footer contains privacy/terms/contact/about only. | Add accessibility statement route and footer link with owner/contact/review details. | Needs decision |
| Low | Header logo | Logo link accessible name was English/generic via image alt. | 2.4.4 Link Purpose, 3.1.2 Language of Parts | Source: `components/layout/Header.tsx`. | Put Hebrew purpose on link; decorative image `alt=""`. | Fixed |
| Low | Dialog close button | Shared dialog close label was English (`Close`) in Hebrew UI. | 3.1.2, 4.1.2 | Source: `components/ui/dialog.tsx`. | Localize screen-reader label to `סגור`. | Fixed |
| Medium | Forgot password | Link points to `#`, so it is focusable but does not perform a meaningful navigation/action. | 2.4.4 Link Purpose, 3.2.4 Consistent Identification | Source/live DOM: `href="#"`, text `שכחת את הסיסמה?`. | Implement password reset route/action or hide/remove until available. | Not fixed |
| Medium | Authenticated areas | Dashboard/questionnaire/result flows not fully audited with real data. | Multiple WCAG AA criteria | `/dashboard` redirected to `/signin`; no test credentials were available. | Provide test credentials or seed a test account in a safe dev environment. | Needs decision |
| Low | Automated scanners | Lighthouse and axe CLI could not launch Chrome in this environment. | Audit process coverage | Lighthouse: `Unable to connect to Chrome`; axe CLI: `SessionNotCreatedError`. Browser script injection was blocked. | Re-run in CI/local Chrome where Lighthouse and axe can start. | Not fixed |

## D. Fixes Applied

- `components/homepage/hero-section.tsx`: changed the main CTA from nested `Link > Button` to `Button asChild > Link`, preserving styling while creating one semantic link.
- `components/homepage/cta-section.tsx`: applied the same CTA semantic fix.
- `app/aboutHolland/page.tsx`: reduced the page to one `h1` and fixed the nested CTA.
- `app/signin/page.tsx`: added an `h1`, descriptive client-side title, announced error container, `aria-describedby`, `aria-invalid`, autocomplete, and replaced blocking `alert()` errors with inline accessible errors.
- `app/signup/page.tsx`: added an `h1`, descriptive client-side title, announced error/success states, autocomplete, and invalid/error associations.
- `components/layout/Header.tsx`: moved the accessible logo purpose to the link in Hebrew and made the logo image decorative.
- `components/ui/dialog.tsx`: localized the shared close control's screen-reader label to Hebrew.

## E. Remaining Recommendations

- Add `/accessibility` or `/accessibility-statement` and link it from the footer.
- Add a real forgot-password/reset flow or remove the placeholder link.
- Create a safe test account for auditing dashboard, questionnaire, modals, generated reports, empty states, loading states, and validation states.
- Run Lighthouse Accessibility and axe-core in CI or a local browser environment that can launch Chrome.
- Add `jsx-a11y` linting rules if the team wants earlier feedback for nested controls, missing labels, and invalid ARIA.
- Consider server-component wrappers for `/signin` and `/signup` metadata so titles are correct before hydration.
- Review all icon images on marketing sections: if decorative, use empty alt text; if informative, localize alt text to Hebrew.

## F. Hebrew Accessibility Statement Draft

הצהרת נגישות - דרך חדשה

אתר דרך חדשה פועל להנגשת השירותים הדיגיטליים שלו לכלל המשתמשים, לרבות אנשים עם מוגבלות. מטרתנו היא שהאתר יהיה נוח לשימוש, ברור, ותואם ככל האפשר לדרישות תקן ישראלי 5568 ולהנחיות WCAG 2.x ברמה AA.

התאמות נגישות שבוצעו או מתוכננות:

- מבנה עמודים עם כותרות, אזורי תוכן וקישורים ברורים.
- תמיכה בממשק עברי מימין לשמאל.
- אפשרות ניווט באמצעות מקלדת באזורים המרכזיים של האתר.
- תוויות לשדות טפסים והודעות שגיאה ברורות.
- ניגודיות צבעים משופרת באזורים המרכזיים.

ייתכן שחלקים מסוימים באתר עדיין אינם נגישים באופן מלא, במיוחד אזורים הנמצאים בפיתוח או אזורים הדורשים התחברות. אם נתקלתם בבעיה, נשמח לקבל פנייה כדי שנוכל לבדוק ולתקן.

דרכי פנייה בנושא נגישות:

- שם רכז/ת נגישות: [להשלמה]
- דוא"ל: [להשלמה]
- טלפון: [להשלמה]
- כתובת: [להשלמה, אם רלוונטי]

בעת פנייה בנושא נגישות מומלץ לציין את כתובת העמוד, תיאור הבעיה, סוג הדפדפן והמכשיר, ואם נעשה שימוש בטכנולוגיה מסייעת.

תאריך עדכון אחרון של הצהרה זו: [להשלמה]

הצהרה זו אינה מהווה ייעוץ משפטי. יש לאשר את הנוסח הסופי מול גורם משפטי או יועץ נגישות מוסמך.

## Verification Notes

- `npm run lint`: completed with warnings; no new blocking lint errors observed. Existing warnings include unused variables/hooks and `<img>` warnings in unrelated files.
- `npm run typecheck`: passed.
- `npm run build`: compilation succeeded; final build phase produced existing lint warnings.
- Dev server: could not restart on port 3000. A pre-existing `node` process (`PID 23700`) remained bound to port 3000 and the sandbox returned `operation not permitted` when terminating it. Per project instruction, no alternate port was used.
- Lighthouse: attempted with default and explicit system Chrome path; both failed with `Unable to connect to Chrome`.
- axe-core CLI: attempted; failed with Chrome `SessionNotCreatedError`. In-browser axe injection was also blocked by the controlled browser sandbox.
