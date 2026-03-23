# NexaStream

Monorepo inicial do NexaStream com:
- `apps/api`: backend NestJS
- `apps/admin`: painel administrativo em Next.js
- `apps/web`: site público e área do cliente em Next.js
- `prisma/schema.prisma`: banco PostgreSQL com Prisma

## Primeiros passos

1. Copie `.env.example` para `.env`
2. Suba o banco:
   - `docker compose up -d`
3. Instale dependências em cada app:
   - `cd apps/api && npm install`
   - `cd ../admin && npm install`
   - `cd ../web && npm install`
4. Gere o Prisma Client:
   - `cd ../../apps/api && npm run prisma:generate`
5. Rode a migração:
   - `npm run prisma:migrate`
6. Inicie os apps:
   - API: `npm run dev:api`
   - Admin: `npm run dev:admin`
   - Web: `npm run dev:web`

## Observações

Esta base está pronta para evolução, mas ainda precisa de:
- instalar dependências reais
- ajustar estilos para Tailwind/shadcn se desejar produção visual
- configurar OAuth Google/Facebook
- configurar Cloudinary
