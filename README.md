# DR-Next

Recreação completa do sistema **DR-Diario** (controle industrial de envase) com stack moderno e UI desenhada do zero.

| Tecnologia | Função |
|---|---|
| **Next.js 15** (App Router · PPR · dynamicIO · SWC) | Web e Admin |
| **Tailwind CSS v4** + **shadcn/ui** (tree-shakeable) | UI minimalista clara |
| **Supabase** (Postgres · Auth · Realtime · MV) | Backend |
| **TanStack** Query · Table · Virtual | Dados, tabelas, virtualização |
| **Jotai** (atoms granulares) | Estado client-side |
| **Valibot** (~600 B/schema, edge-first) | Validação |
| **recharts** | Visualizações |
| **Vercel Edge** (middleware leve · ISR tag-based) | Auth + revalidação |
| **Edge Config** (<1ms) | Feature flags |
| **Turborepo** + **pnpm** workspaces | Monorepo |
| **Vitest** + **Playwright** | Testes unitários + e2e |

## Estrutura

```
apps/
  web/    → :3000 — operadores e consulta geral
  admin/  → :3001 — apenas líderes
packages/
  ui/     → shadcn/ui + primitives + tokens Tailwind v4
  db/     → clients Supabase + schemas Valibot + queries + realtime + flags
  charts/ → wrappers Recharts (4 tipos + ChartCard)
  config/ → tsconfigs + eslint + prettier compartilhados
supabase/
  migrations/  → 8 migrações (extensões → enums → tabelas → MVs → RLS → auth hook → seed)
  seed.sql     → usuários de dev (apenas local)
e2e/      → testes Playwright cross-app
```

## Stack diff vs DR-Diario original

| Original | Novo | Motivo |
|---|---|---|
| MUI v9 + DataGrid | shadcn/ui + TanStack Table + Virtual | tree-shakeable, menor bundle |
| Zustand | Jotai | atoms granulares, melhor SSR |
| Zod | Valibot | ~600 B/schema, edge-first |
| 3 canais realtime | 1 canal multiplexado | menos overhead, 1 ctx |
| Audit log no cliente | trigger `tg_audit()` no DB | confiável, não burlável |
| Recursos hardcoded | tabela `resources` | gerenciáveis via /recursos |
| Status de produção em string | enums Postgres + `EXCLUDE` constraint | invariantes garantidas no DB |
| Sem materialized views | `mv_daily_production`, `mv_resource_ranking`, `mv_attendance_summary` | dashboards rápidos |

## Setup local

```bash
pnpm install
cp .env.example .env.local      # edite com suas credenciais
```

### Opção A — Supabase local (recomendado para dev)

```bash
pnpm db:start     # supabase start (Docker)
pnpm db:reset     # aplica todas as migrations + seed
pnpm db:types     # regera packages/db/src/types/database.ts
pnpm dev          # web :3000, admin :3001
```

Credenciais do seed:
- **Líder**: `lider@dr.local` / `DrNext!2026`
- **Operador**: `operador1@dr.local` / `DrNext!2026`

### Opção B — Supabase remoto (projeto `jqxrsnnhmemqjgqypcre`)

Use o arquivo `.env.local` já preenchido com suas credenciais, depois:

```bash
# 1. Link com o projeto remoto
supabase link --project-ref jqxrsnnhmemqjgqypcre

# 2. Aplique as migrations
supabase db push

# 3. Habilite o Custom Access Token Hook no Dashboard:
#    Authentication → Hooks → Custom Access Token → escolha:
#      public.custom_access_token_hook

# 4. Crie usuários iniciais no Dashboard (Authentication → Users)
#    Adicione manualmente em raw_user_meta_data: { "role": "leader" }
#    O trigger handle_new_user criará o profile automaticamente.

# 5. Rode dev
pnpm dev
```

⚠️ As credenciais `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` e `POSTGRES_PASSWORD` que você compartilhou aparecem no histórico do chat — **rotacione-as** no Dashboard (Settings → API → Roll keys) antes de subir para produção.

## Scripts úteis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Sobe web e admin em paralelo |
| `pnpm dev:web` / `pnpm dev:admin` | Apenas uma app |
| `pnpm build` | Build de tudo |
| `pnpm lint` | Lint via Turborepo |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Vitest em todos os pacotes |
| `pnpm test:e2e` | Playwright |
| `pnpm db:reset` | Reseta Supabase local |
| `pnpm db:types` | Regera tipos TypeScript |

## Deploy (Vercel)

Há **dois projetos Vercel** (um por app). O ID do projeto fornecido (`prj_sXqtf1fgeHJ6kXoyJSANLUuzBXCF`) corresponde a um deles — crie o segundo seguindo o mesmo padrão.

```bash
# Setup inicial (uma vez por projeto)
cd apps/web
vercel link                       # selecione o projeto existente
vercel env pull .env.production   # baixa env vars do dashboard

cd ../admin
vercel link                       # crie/selecione o projeto admin
```

Variáveis obrigatórias em ambos os projetos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (apenas admin precisa)
- `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` → `.seudominio.com` em produção
- `NEXT_PUBLIC_WEB_URL` e `NEXT_PUBLIC_ADMIN_URL`
- `EDGE_CONFIG` (opcional, para feature flags)

Para SSO funcionar entre web e admin em produção, os dois domínios precisam compartilhar o mesmo parent (ex: `app.dr.com` + `admin.dr.com`), e `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` precisa ser setado para `.dr.com`.

## Decisões arquitetônicas

### 1. Canal realtime único

`packages/db/src/realtime/channel.ts` cria um único `RealtimeChannel` que escuta `postgres_changes` em 6 tabelas + 3 eventos de broadcast. Montado uma vez no `<RealtimeProvider>` acima do `<QueryClientProvider>`. Componentes assinam via `useRealtimeSubscription(key, handler)`.

### 2. Audit pelo trigger, não pelo cliente

A função `tg_audit()` (em `supabase/migrations/...040_triggers.sql`) escreve em `audit_logs` após cada INSERT/UPDATE/DELETE com diff JSON. Detecta automaticamente transições `pending → active` (start), `active → completed` (finish), e soft-deletes. O cliente nunca chama "log this action".

### 3. JWT carrega o `role`

O Custom Access Token Hook (`...070_auth_hook.sql`) injeta `profiles.role` em `app_metadata.role` na emissão do JWT. Isso permite que o middleware do `apps/admin` faça role gate **sem consultar o banco** em cada request edge.

### 4. EXCLUDE constraint em produção

`production_runs` tem uma constraint `EXCLUDE USING gist` que **garante no DB** que não existem dois runs `active` no mesmo `resource_id` simultaneamente. Antes era resolvido em UI no original; agora é uma invariante do schema.

### 5. Cookie compartilhada para SSO

`packages/db/src/auth/cookie-options.ts` define o nome e domínio da cookie em um único lugar, consumido por browser/server/middleware clients. Em produção, set `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.seudominio.com` e ambos os apps compartilham sessão.

### 6. Materialized views para KPIs

`mv_daily_production`, `mv_resource_ranking` e `mv_attendance_summary` agregam dados pesados para dashboards. Refresh via cron Supabase Edge Function (a configurar em `supabase/functions/refresh-mvs/`) ou via RPC `refresh_production_mvs()` após mutações críticas.

### 7. Feature flags em RSC

`packages/db/src/flags/index.ts` lê de Vercel Edge Config (<1ms). **Sempre consumido em RSC**, passado como prop para Client Components. Nunca chame `getFlag()` no client.

## Próximos passos para completar o painel admin

As páginas admin de `producao`, `assiduidade` (CRUD completo) e detalhamento de `recursos` estão como stubs em construção. O scaffold (layout, sidebar, role gate, providers) já está pronto — só precisa replicar o padrão das páginas web com server actions + `revalidateTag`.
