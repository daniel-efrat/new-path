# UI Specification – Career Diagnosis MVP

## 1 User Experience (UX) Principles

1. **Mobile‑First Thumb Reach** – every interactive element reachable within ≤ 44 px for single‑hand thumb use.
2. **Simplicity & Pacing** – show ≤ 3 questions per screen, clear progress bar, motivating micro‑copy.
3. **Friendly Tone** – conversational copy; emojis as positive feedback (optional).
4. **Trust & Safety** – display "GDPR ✓" badge and "No commitment" label next to the submit button.
5. **Accessibility (WCAG 2.1 AA)** – contrast ratio ≥ 4.5:1, full keyboard navigation.

---

## 2 Key Screens & Components

| # | Screen | Brief Description | ShadCN Components |
|---|-----------------------|-----------------------------------------------------|----------------------------------------------|
| 1 | **Landing / Hero** | Title "What’s Your Path?", CTA button "Start Assessment" | `Card`, `Button`, `Badge` |
| 2 | **Auth – Magic Link** | Email input, "Send Link" button | `Input`, `Button`, `Alert` |
| 3 | **Questionnaire** | 4‑step stepper, ≤ 3 questions per screen | `Stepper`, `RadioGroup`, `Select`, `Slider`, `Button` |
| 4 | **Loading / AI Processing** | Animation, text "Calculating your matches…" | `Skeleton`, `Spinner` |
| 5 | **Results Dashboard** | Profession cards × 3‑5, college cards × 3‑5 | `Card`, `Accordion`, `Button`, `Badge` |
| 6 | **Thank‑You / Share** | Thank‑you message, WhatsApp share button | `Card`, `Button`, `Popover` |

---

## 3 Typography & Color Palette

| Element | Font | Size | Weight | Color (Light / Dark) |
|---------|------|------|--------|----------------------|
| H1 | Rubik | 28 pt | 700 | `#111827` / `#ffffff` |
| Body | Rubik | 16 pt | 400 | `#374151` / `#e5e7eb` |

*Primary Accent (Color scale Emerald 500‑300).*  
*Secondary Accent (Color scale Indigo 500‑300).*  
*Background Light `#ffffff`; Background Dark `#1f2937`.*

---

## 4 Responsive Grid & Breakpoints (Tailwind)

| Alias | Width Range | Prefix | Example Usage |
|-------|-------------|--------|---------------|
| **xs** | &lt; 360 px | *mobile‑first* | Low‑end phones, embedded views |
| **sm** | ≥ 360 px | `sm:` | Most smartphones |
| **md** | ≥ 640 px | `md:` | Large phones / small tablets |
| **lg** | ≥ 1024 px | `lg:` | Tablets landscape, small laptops |
| **xl** | ≥ 1280 px | `xl:` | Laptops / desktops |
| **2xl** | ≥ 1536 px | `2xl:` | Large desktops |

Grid: **12‑column CSS Grid** with `gap‑x‑4 gap‑y‑6`; container `max‑w‑7xl mx‑auto px‑4`.

---

## 5 Component Inventory (ShadCN)

| Component | Key Props | Variants | Loading/Error States |
|-----------|-----------|----------|----------------------|
| **QuestionCard** | `title` `icon` `children` | `variant="profession"` / `variant="college"` | `Skeleton` pulsing placeholder |
| **ProgressStepper** | `current` `total` | — | — |
| **MagicLinkForm** | `onSubmit` | — | `isSending` spinner; error alert |
| **ResultAccordion** | `items` | `defaultOpen` | Graceful collapse/expand |
| **CTAButton** | `href` `icon` | `primary` / `secondary` | `disabled` opacity 50 % |

---

## 6 Motion Guidelines

### Micro‑Interactions

| Interaction | Effect | Duration | Tailwind / Framer Motion |
|-------------|--------|----------|-------------------------|
| Button tap | Scale‑down to 95 % + reduce shadow | 150 ms | `active:scale-95 active:shadow-sm` |
| Card hover | Elevate + translate‑y‑1 | 200 ms | `hover:shadow-lg hover:-translate-y-1` |
| Step completed | Progress bar fill animation | 300 ms | `transition-all` |

Page transitions use `framer-motion` `<AnimatePresence>` with cubic‑bezier `[0.22,0.61,0.36,1]`, duration 0.3 s.  
Respect `prefers-reduced-motion` by disabling all transforms.

---

## 7 Copy & Tone Guide

* **Voice:** Friendly mentor, supportive and concise.  
* **Max sentence length:** 12 words.  
* **Positive framing:** “Choose 5 core values” (avoid negatives).

**Do / Don’t Examples**

| ✔ Do | ✖ Don’t |
|------|--------|
| “Start Assessment” | “Execute Diagnosis” |
| “No commitment, cancel anytime” | “Cannot cancel once started” |

Emoji usage: 👍 as success, ❌ only for severe errors.

---

## 8 Form Style Guide

* Text inputs height `h‑11`, rounded‑lg, border `gray-300`.  
* Focus ring `ring‑2 ring‑emerald‑500`, error ring `rose‑500`.  
* Validation messages `text‑rose‑600`.  
* Progress bar `h‑2 rounded-full bg‑gray‑200`, filled portion `bg‑emerald‑500 transition-all`.

Accessibility checklist: `label` linked via `htmlFor`, `aria‑invalid` on error, contrast ≥ 4.5.

---

## 9 QA & Testing Plan

* **Manual cross‑browser matrix:** Chrome, Firefox, Safari, Edge on key breakpoints.  
* **E2E automation:** Playwright `npm run test:e2e`.  
* **Accessibility audit:** axe‑core, Lighthouse score ≥ 90.  
* **Definition of Done:** All tests pass, CI green, Lighthouse, Sonar.

---

### PDF Export
Print the HTML page (RTL or LTR) via **Ctrl/Cmd + P → Save as PDF** with margins “None”.

