# AI Revenue Reactivation Agent MVP

A Vercel-ready Next.js MVP that simulates a HubSpot-connected AI sales agent. It surfaces dormant high-fit leads, uses CRM notes, call summaries and meeting context, and drafts a personalised re-engagement email.

## What is included

- Standalone Next.js app
- Dummy HubSpot-style CRM data
- Lead scoring and persona detection
- AI analysis with OpenAI if `OPENAI_API_KEY` is present
- Fallback deterministic analysis if no API key is configured
- Dashboard and detail view

## Notes from calls and meetings

Yes. This prototype already includes those fields in the dummy data model:

- `notes`
- `calls`
- `meetings`

In a real HubSpot integration, those would typically come from engagement objects such as notes, calls and meetings, if the account has them logged and accessible.

## Local development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push the folder to GitHub
2. Import the repo into Vercel
3. Add `OPENAI_API_KEY` if you want live AI-generated output
4. Deploy

## Suggested next build step

Replace `lib/data.ts` with a real HubSpot fetch layer and map HubSpot engagements into the `notes`, `calls` and `meetings` fields used here.
