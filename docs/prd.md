# Career‑Diagnosis MVP Product Requirements Document (PRD)

## 1 Goals and Background Context

### 1.1 Goals
- Provide an automated, mobile‑friendly questionnaire that collects essential MUST data fields and stores them in Supabase.
- Trigger an n8n → OpenAI pipeline that returns: (a) 3‑5 suitable professions, (b) 3‑5 partner colleges per profession (with ReferralID), and (c) salary ranges.
- Display results instantly in the user dashboard and log each referral click for commission tracking.
- Achieve ≥ 20 % conversion from completed questionnaire to college referral within 3 months of launch.
- Deliver the MVP (Quick‑Win scope A‑C) to production within 4 weeks, using the agreed tech stack (NextJS 14, TailwindCSS + ShadCN, Supabase, n8n).

### 1.2 Background Context
The startup targets Israeli post‑army youth who are uncertain about their study path. The business model earns a referral commission (“שידוך”) when a candidate enrolls in a partner college. Early workshops identified a lean flow: a concise form (7 MUST questions) feeds an AI matching engine. Quick‑Win components A‑C (see brainstorming summary) form the MVP and support rapid revenue generation while building trust with partner institutions.

### 1.3 Change Log
| Date (DD‑MM‑YYYY) | Version | Description              | Author |
| ----------------- | ------- | ------------------------ | ------ |
| 17‑07‑2025        | 0.1     | Initial Goals & Context  | Daniel + PM |

