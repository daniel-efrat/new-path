# Branded Auth Email

Use `confirm-signup.html` in the Supabase Dashboard under **Authentication >
Email Templates > Confirm signup**.

Suggested subject:

```text
אישור כתובת האימייל שלך | דרך חדשה
```

The template preserves the existing `{{ .ConfirmationURL }}` confirmation
flow used by the app's `/auth/callback-client` route. It loads the brand's
`Assistant` typeface from Google Fonts with Arial/system fallbacks for email
clients that do not allow remote web fonts.

Use `reset-password.html` in the Supabase Dashboard under **Authentication >
Email Templates > Reset password**.

Suggested subject:

```text
איפוס הסיסמה שלך | דרך חדשה
```

## Public Assets

The cloud Supabase project has a public `email-assets` bucket containing the
email artwork:

- Logo: `https://hhcjagfhomddigmlbefj.supabase.co/storage/v1/object/public/email-assets/branding/logo-white.png`
- Footer icon: `https://hhcjagfhomddigmlbefj.supabase.co/storage/v1/object/public/email-assets/branding/icon-mark.png`

The bucket is public for email-client image delivery. Anonymous upload access
was removed after seeding these two assets.
