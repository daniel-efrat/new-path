**Story 1: User Completes Initial Questionnaire**

*   **As a:** Post-army youth exploring career options
*   **I want to:** Fill out a simple, mobile-friendly questionnaire about my skills and preferences
*   **So that:** I can get personalized career and college recommendations.

**Acceptance Criteria:**

1.  **Questionnaire Display:**
    *   The application must render a multi-step questionnaire page using NextJS 14 (App Router).
    *   The UI must be built with TailwindCSS and ShadCN components, ensuring a mobile-first, responsive design.
    *   The questionnaire must consist of exactly 7 questions covering the essential MUST data fields.

2.  **Form State Management:**
    *   User inputs must be persisted client-side as they progress through the questionnaire.
    *   The state should be managed using Zustand, preventing data loss on page refresh.

3.  **Authentication:**
    *   The submission process must be protected. If the user is not authenticated, they should be prompted to sign in or sign up using a Supabase Magic Link before they can submit.
    *   The user's session must be managed using `@supabase/auth-helpers-nextjs`.

4.  **Form Submission:**
    *   Upon completion, a "Submit" button sends the collected answers to the backend.
    *   The submission must trigger a `POST` request to the `/api/submit` endpoint, including the user's JWT for authorization.
    *   The questionnaire must include a GDPR consent checkbox that is required before submission.

5.  **Data Persistence:**
    *   The `/api/submit` endpoint must validate the incoming data.
    *   On successful validation, the endpoint will use `@supabase/supabase-js` to insert a new row into the `applicants` table in the Supabase Postgres database. The row must contain the user's `user_id` and their answers in the `jsonb` column.

6.  **Analytics & Tracking:**
    *   The application must log questionnaire start and completion events to the `events` table for conversion tracking.
    *   Each referral click must be logged to support the ≥ 20% conversion KPI from completed questionnaire to college referral.

7.  **User Feedback:**
    *   After a successful submission, the user is redirected to a dashboard page where they will be shown a message indicating their results are being generated.
    *   If the submission fails, a clear, non-technical error message must be displayed to the user, and their form data must remain intact for a retry.

**Technical Notes:**

*   This story covers the "Quick-Win A" scope mentioned in the PRD.
*   The specific 7 "MUST" questions are not yet defined and will be provided separately.
*   Initial implementation will focus on the data capture flow. The n8n trigger and AI processing will be handled in a subsequent story.
*   This story will be considered complete when users can successfully submit the form and data is stored in Supabase. The AI processing will be implemented in Story 2.
