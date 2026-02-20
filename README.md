# Fatih Portfolio

## AI Search Assistant (same-page answer)

### What was added
- In-page **AI Answer Container** under the search input (no modal/popup).
- Hybrid answer flow:
  1. Local KB match from `data/ai_kb.json`
  2. Fallback to `POST /api/ask` proxy when local confidence is low
- Suggested follow-up question chips under the answer.
- Navigational queries (UI/UX, 3D, AI, VR/AR, Architecture) trigger existing category filtering.

### Edit local KB
File: `data/ai_kb.json`

Each entry:
```json
{
  "intent": "about_fatih",
  "keywords": ["who is fatih", "about fatih"],
  "responses": ["..."],
  "followups": ["..."]
}
```

Guidelines:
- Add multiple keyword variants in English.
- Keep responses grounded in actual repo/site data.
- If a fact is uncertain, phrase neutrally (do not guess).

## Cloudflare Worker Proxy (`/api/ask`)

Files:
- `worker/ask-worker.js`
- `worker/wrangler.toml`

### Choose one runtime
- Production static hosting: use the Cloudflare Worker route for `/api/ask`.
- Local/private resume-based answering: use `server.js` endpoint `/api/ask` with `RESUME_SOURCES_JSON`.

### Deploy
1. Install Wrangler:
```bash
npm i -g wrangler
```
2. Set secret:
```bash
cd worker
wrangler secret put GEMINI_API_KEY
```
3. Deploy:
```bash
wrangler deploy
```
4. Ensure DNS record exists in Cloudflare:
   - Type: `CNAME`
   - Name: `ai`
   - Target: `fatihgulen.com`
   - Proxy: `Proxied` (orange cloud)
5. Worker route:
   - `ai.fatihgulen.com/api/*` (already defined in `worker/wrangler.toml`)
6. Test endpoint:
```bash
curl -X POST https://ai.fatihgulen.com/api/ask \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"hello\"}"
```

### Security in worker
- API key only in Worker secret (`GEMINI_API_KEY`)
- Allowed origins:
  - `https://fatihgulen.com`
  - `https://www.fatihgulen.com`
- Basic in-memory per-IP rate limiting
- Frontend production endpoint is `https://ai.fatihgulen.com/api/ask`

## Local testing

1. Start static/dev server for site (existing flow).
2. Set backend env vars in your shell before start:
```bash
# PowerShell
$env:GEMINI_API_KEY="YOUR_NEW_KEY"
$env:GEMINI_MODEL="gemini-1.5-flash"
$env:RESUME_SOURCES_JSON='[{"id":"ai_vrp","label":"AI_VRP_Fatih","filePath":"C:\\Users\\Casper\\Downloads\\Resumes\\AI_VRP_Fatih.pdf","tags":["ai","vr","ar","unity","huawei","thesis"]}]'
```
3. Start backend:
```bash
npm start
```
4. (Optional) Run worker locally:
```bash
cd worker
wrangler dev --local
```
5. If local origin differs, temporarily add local origin in worker `ALLOWED_ORIGINS` for dev only.
6. Resume sources are backend-only and can be configured with `RESUME_SOURCES_JSON`.
   They are read by backend only and are not exposed as static files.
7. Verify backend source readiness:
```bash
curl http://localhost:3000/api/ask/health
```
8. Test checklist:
- Enter key submits
- Search button submits
- Known query uses local KB (`data/ai_kb.json`) and shows answer
- Unknown query calls `/api/ask` and shows returned answer
- Navigational query filters category and still shows answer
- Mobile layout still usable (answer container/chips wrap correctly)
- No API key appears in frontend source or browser network requests
