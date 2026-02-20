# Fatih Portfolio

## Cloudflare Worker Gemini Proxy (workers.dev)

Production uses a static frontend and a Cloudflare Worker proxy. No API key is stored in frontend code.

Files:
- `worker/ask-worker.js`
- `worker/wrangler.toml`

Worker behavior:
- Accepts `POST /` and `POST /api/ask`
- Expects JSON body: `{ "query": "..." }`
- Reads secrets from Worker runtime: `env.GEMINI_API_KEY`
- Optional model var: `env.GEMINI_MODEL` (default: `gemini-1.5-flash`)
- Returns JSON: `{ "answer": "..." }`

CORS allowlist:
- `https://fatihgulen.com`
- `https://www.fatihgulen.com`
- `http://localhost:8000` (local test)

## Deploy Worker

1. Install Wrangler
```bash
npm i -g wrangler
```

2. Login
```bash
wrangler login
```

3. Set secrets (inside `worker/`)
```bash
cd worker
wrangler secret put GEMINI_API_KEY
```

4. Optional model variable
```bash
wrangler secret put GEMINI_MODEL
```

5. Deploy
```bash
wrangler deploy
```

## workers.dev URL in frontend

After deploy, copy your Worker URL from Cloudflare, format:
- `https://<worker-name>.<account-subdomain>.workers.dev`

Frontend should call:
- `https://<worker-name>.<account-subdomain>.workers.dev/api/ask`

Current code default endpoint is set in `index.html` under `askProxy()`.
You can override at runtime with:
- `window.__AI_ENDPOINT = "https://<worker>.<account>.workers.dev/api/ask"`

## PowerShell quick test

```powershell
Invoke-RestMethod -Method POST -Uri "https://<worker>.<account>.workers.dev/api/ask" -ContentType "application/json" -Body '{"query":"hello"}'
```

## Security notes

- Never commit real API keys.
- Keep `.env` and `.env.*` ignored in git.
- Worker does not depend on `.env` in production.
