# haus-node 🎨

Node-baserad AI Creative Studio — en fullständig inhouse-klon av Weavy.ai & Freepik Spaces.

## Stack

| Lager | Teknik |
|---|---|
| Frontend | Next.js 15, React Flow, Zustand, Tailwind |
| Backend | Node.js, Fastify, BullMQ |
| Databas | PostgreSQL (Drizzle ORM) |
| Cache/Queue | Redis |
| AI-modeller | fal.ai, OpenAI, Replicate |
| Storage | S3/R2-kompatibel (MinIO lokalt) |
| Auth | Clerk |

## Kom igång

### 1. Klona & installera

```bash
npm install
```

### 2. Starta infrastruktur (Docker)

```bash
docker compose up -d
```

### 3. Konfigurera env

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Fyll i dina API-nycklar
```

### 4. Kör databas-migrationer

```bash
cd apps/api
npm run db:migrate
```

### 5. Starta dev

```bash
# Från roten:
npm run dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (admin/minioadmin)
- **DB Studio**: `cd apps/api && npm run db:studio`

## Arkitektur

```
haus-node/
├── apps/
│   ├── web/          # Next.js frontend med React Flow canvas
│   └── api/          # Fastify API + BullMQ workers
└── packages/
    ├── types/         # Delade TypeScript-typer
    ├── node-registry/ # Alla AI-noddefinitioner
    └── ui/            # Delade UI-komponenter
```

## Noder (v0.1)

### Bildgenerering
- Flux Pro / Dev / Schnell
- Ideogram V3
- DALL·E 3
- Recraft V3

### Videogenerering
- Kling 2.5 (text & image-to-video)
- Runway Gen-4
- Wan 2.2
- LTX Video

### Bildredigering
- Background Remover
- Image Upscaler
- Inpainting
- Outpainting
- Image-to-Image

### Hjälpnoder
- Text / Number / Seed inputs
- Import / Export / Preview
- Prompt Enhancer (GPT-4o)
- Image Describer (GPT-4o Vision)
- Text Iterator (batch)

## Lägga till en ny nod

1. Lägg till en `NodeDefinition` i `packages/node-registry/src/nodes/`
2. Exportera från `src/index.ts`
3. Om ny provider: lägg till execution-logik i `apps/api/src/workers/job.worker.ts`

## Roadmap

- [ ] LoRA-hantering & CivitAI-import
- [ ] Design App-läge (publicera workflows)
- [ ] Team-samarbete (Yjs real-time)
- [ ] Developer REST API + webhooks
- [ ] Stripe-integration för credits
- [ ] 3D, Audio, Lip Sync-noder
- [ ] Replicate-integration
