# CMB Study Tool

An AI-powered flashcard and quiz generator built for Cellular & Molecular Biology students. Upload your lecture notes or PDFs and instantly generate flashcards and practice questions.

## Features

- **PDF & text upload** — upload your notes directly or paste text
- **AI flashcard generation** — terms and definitions pulled from your actual notes
- **3 question types** — multiple choice (auto-graded), fill in the blank, and short answer
- **Flashcard deck tools** — flip, shuffle, reset, and mark cards as known
- **Serverless API proxy** — your Anthropic API key stays secure on the server

---

## Getting Started Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/cmb-study-tool.git
cd cmb-study-tool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

Create a `.env` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** The `/api/generate` serverless function requires Vercel CLI to run locally.
> Install it with `npm i -g vercel` and then run `vercel dev` instead of `npm run dev`.

---

## Deploying to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-key-here`
5. Click **Deploy**

That's it — Vercel auto-detects Vite and the `api/` folder.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

Follow the prompts, then set your env variable:

```bash
vercel env add ANTHROPIC_API_KEY
```

---

## Project Structure

```
cmb-study-tool/
├── api/
│   └── generate.js         # Vercel edge function — proxies Anthropic API
├── src/
│   ├── components/
│   │   ├── NotesInput.jsx   # File upload + text paste + generation controls
│   │   ├── Flashcards.jsx   # Flip card deck with shuffle / mark known
│   │   └── Quiz.jsx         # MC, fill-in-the-blank, short answer questions
│   ├── lib/
│   │   ├── api.js           # Calls /api/generate and parses the response
│   │   └── extractText.js   # PDF and text file extraction via pdfjs-dist
│   ├── App.jsx              # Tab layout, state management
│   ├── App.module.css
│   └── index.css            # Global CSS variables and theme
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## How It Works

1. You upload a PDF or paste your notes into the Notes tab
2. The text is sent to `/api/generate` (a Vercel Edge Function)
3. The edge function forwards the request to the Anthropic API using your server-side API key
4. Claude reads your notes and returns structured JSON with flashcards and quiz questions
5. The app renders them in the Flashcards and Quiz tabs

Your API key is **never exposed to the browser** — all calls go through the edge function.

---

## Extending the Tool

Some ideas for future additions:

- **Progress persistence** — save known cards to localStorage between sessions
- **Topic tagging** — group cards by topic (cell cycle, transcription, etc.)
- **Spaced repetition** — surface cards you've missed more frequently
- **Export** — download flashcards as CSV or Anki-compatible format
- **Image support** — paste screenshots from textbooks directly

---

## Requirements

- Node.js 18+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- A Vercel account (free tier works fine)
