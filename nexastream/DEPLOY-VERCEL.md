# Deploy na Vercel para nexastream.fun

## Projetos
Crie 2 projetos separados na Vercel a partir do mesmo repositório:

- `nexastream-web` com Root Directory `apps/web`
- `nexastream-admin` com Root Directory `apps/admin`

## Build settings
Para os dois projetos:

- Framework Preset: Next.js
- Root Directory: `apps/web` ou `apps/admin`
- Install Command: `npm install`
- Build Command: `npm run build`
- Node.js: 20.x

## Variáveis do site público

```env
NEXT_PUBLIC_API_URL=https://api.nexastream.fun
```

## Variáveis do admin

```env
NEXT_PUBLIC_API_URL=https://api.nexastream.fun
```

## Domínios

- `nexastream.fun` -> projeto web
- `www.nexastream.fun` -> alias do projeto web
- `admin.nexastream.fun` -> projeto admin

## API
A API não deve ir para a Vercel neste formato atual. Hospede `apps/api` em Railway, Render, VPS ou cPanel com Node.js.

Use estas variáveis no backend:

```env
FRONTEND_WEB_URL=https://nexastream.fun
FRONTEND_ADMIN_URL=https://admin.nexastream.fun
GOOGLE_CALLBACK_URL=https://api.nexastream.fun/api/auth/google/callback
FACEBOOK_CALLBACK_URL=https://api.nexastream.fun/api/auth/facebook/callback
```
