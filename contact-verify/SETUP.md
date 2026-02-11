# Contact Verification Worker Setup

This worker handles email verification for contact forms and forwards verified messages via Resend.

## 1) Create Worker

1. Open Cloudflare Dashboard > Workers & Pages.
2. Create a new Worker (or use the existing one).
3. Paste the code from `worker.js` and deploy.

## 2) Bind KV Namespace

Create a KV namespace and bind it to the worker:
- Binding name: `CONTACT_KV`

## 3) Set Environment Variables

Required:
- `RESEND_API_KEY` (secret: `re_Fzaoqssk_9gxEEMgGtx4CW51TSi4mUV5i`)
- `FROM_EMAIL` (example: `noreply@thelizards.it`)
- `CONTACT_TO_EMAIL` (default fallback recipient, example: `thelizband@gmail.com`)

Optional:
- `PUBLIC_BASE_URL` (example: `https://contact-verify.lizberries.workers.dev`)
- `ALLOWED_ORIGINS` (comma-separated list of allowed origins)
- `VERIFY_SUBJECT` (custom verification email subject)
- `CONTACT_SUBJECT_PREFIX` (custom subject prefix for team emails)
- `CONTACT_TO_EMAIL_THELIZARDS` (recipient for The Lizards)
- `CONTACT_TO_EMAIL_5CEREALIZ` (recipient for 5 Cerealiz)
- `CONTACT_TO_EMAIL_LIZBERRIES` (recipient for The Lizberries)
- `USE_REPLY_TO` (`true` or `false`)
- `SKIP_RATE_LIMIT` (`true` or `false`, set to `true` to bypass rate limiting during tests; keep `false` in production)

Example per-project recipients:
- `CONTACT_TO_EMAIL_THELIZARDS=thelizards@thelizards.it`
- `CONTACT_TO_EMAIL_5CEREALIZ=5cerealiz@gmail.com`
- `CONTACT_TO_EMAIL_LIZBERRIES=lizberries@thelizards.it`

## 4) Resend Domain

Make sure the domain used in `FROM_EMAIL` is verified in Resend, otherwise Resend will reject the send.

## 5) Frontend Endpoint

Set the frontend constant to your worker base URL:
- `CONTACT_WORKER_URL = "https://contact-verify.lizberries.workers.dev"`

The frontend sends POST requests to:
- `POST /request`

The verification link points to:
- `GET /verify?token=...`

## 6) Test

1. Submit the form.
2. Check your inbox and click the verification link.
3. Confirm the team inbox receives the message.
