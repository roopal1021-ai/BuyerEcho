# BuyerEcho

A tough room of five for your marketing copy.

BuyerEcho runs P&C insurance marketing assets through a panel of five synthetic buyer personas (CEO, CUO, CCO, Head Actuary, CIO) and returns a structured evaluation: composite score, four-dimension breakdown, in-voice reaction, ranked objections, action guidance, and an optional competitor differentiation lens with live web research.

## Stack

- Vite + React 18 (single-page app)
- Framer Motion for transitions
- Recharts for analytics views
- Lucide for icons
- Mammoth + pdf.js for file extraction (DOCX, PDF)
- jsPDF for export
- Vercel serverless function as the Anthropic API proxy (keeps the API key off the client)

## Local development

You need Node 18+ and an Anthropic API key.

```bash
git clone <this repo>
cd buyerecho
npm install
cp .env.example .env.local
# edit .env.local and paste in your ANTHROPIC_API_KEY
```

Then run the dev server with the API proxy. The simplest path is the Vercel CLI, which runs both at once on the same port:

```bash
npm install -g vercel
vercel dev
```

That serves the Vite app and the `/api/claude` function together at `http://localhost:3000`.

If you'd rather run them separately:

```bash
# terminal 1: API only
vercel dev --listen 3000
# terminal 2: Vite only
npm run dev
```

Vite is configured to proxy `/api` to `localhost:3000`.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the repo in Vercel. It auto-detects Vite from `vercel.json`.
3. Under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` with your key.
4. Deploy.

The serverless function in `api/claude.js` becomes the `/api/claude` endpoint automatically. No extra configuration needed.

## How it works

### App phases

`App.jsx` is a state machine. The phases:

```
loading → welcome → bootstrap → review → library
                  ↘ import ↗

library → detail → edit
       ↘ eval-form → eval-progress → eval-report
       ↘ analytics
       ↘ history → eval-report
```

First-time users hit `welcome`, then `bootstrap` instantly loads the five prebaked personas, then `review` lets them inspect each one before saving as version 1. Returning users skip straight to `library`.

### The evaluation pipeline

Five stages, each a separate API call to keep responses tight and parseable:

1. **Stage 1 (required):** Score the asset across persuasion, clarity, differentiation, and buyer fit. Composite score is the weighted sum.
2. **Stage 2a:** In-voice reaction. Two or three sentences in the persona's actual voice.
3. **Stage 2b:** Ranked objections (blocker, concern, nitpick) with what would answer each one.
4. **Stage 3:** Diagnosis (what works, what breaks) and prioritized action items.
5. **Stage 4 (optional):** Per-competitor differentiation lens, one call per competitor, with web search grounding.

Stages 2 through 4 are all recoverable. If any of them fail, the report still saves with the sections that completed plus an `incomplete_sections` marker so the user knows what's missing.

### Storage

`src/lib/storage.js` is a thin layer over `window.storage`, the artifact key-value store. It handles persona versioning, evaluation CRUD, and full export/import as JSON.

For a real production deployment, swap that one file out for Supabase, Vercel KV, or Postgres. The interface is small and intentional, so it's a clean replacement.

### File structure

```
api/
  claude.js                       Vercel serverless proxy
src/
  tokens.js                       Design tokens, score band utility
  main.jsx                        ReactDOM entry
  App.jsx                         State orchestrator
  constants/
    personas.js                   Five prebaked persona profiles
    assetTypes.js                 Asset types, weights, rubrics, competitors, LOBs
  prompts/
    evalPrompts.js                All five stage prompt builders
  lib/
    api.js                        Claude API client (routes to /api/claude)
    storage.js                    Persistence layer
    fileExtraction.js             PDF, DOCX, TXT extraction
    pdf.js                        PDF generation for personas and reports
  components/
    primitives/                   Logo, buttons, modals, avatars
    personas/                     PersonaCard, PersonaDetail, PersonaLibrary, EditPersona
    layout/                       AppHeader, Welcome, Import, Bootstrap, History
    evaluation/                   Form, Progress, Report
    analytics/                    Four analytics views with tab controller
```

## Asset types and dimension weights

Different asset types are weighted differently. A positioning statement is internal so persuasion is irrelevant (weight 0). A battle card lives or dies on differentiation (weight 45%). A data sheet is mostly clarity and buyer fit. Full table is in `src/constants/assetTypes.js`.

## Personas

The five buyer panel members are defined in `src/constants/personas.js` with full profiles covering identity, mandate and KPIs, buying behavior, information diet, disposition traits (1 to 10 scale), objection library, vocabulary, and tier and region context modulators.

You can edit any persona in the UI. Edits create a new version. The previous version is preserved.

## Bundle size

The production build comes in around 1.3MB ungzipped, 360KB gzipped. The biggest contributors are mammoth (DOCX parsing), recharts, and framer-motion. If you need to slim it down:

```js
// Lazy-load mammoth only when a DOCX is uploaded
const mammoth = await import('mammoth')
```

Same approach works for the analytics views with recharts.

## Safety notes

- The Anthropic API key never reaches the browser. Every model call goes through `/api/claude`.
- The export feature gives users a backup of their data they can re-import. Useful before a reset.
- The import flow validates the export version before writing anything.
- Reset is gated behind a confirmation dialog. It deletes all keys, not selectively.

## License

Proprietary. All rights reserved.
