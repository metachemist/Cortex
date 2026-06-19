# Cortex

A unified AI workspace with persistent memory across all major LLMs. Your prompts, skills, workflow habits, and preferences live in Cortex — and get automatically injected into every conversation, no matter which model you use.

> "Your AI memory, your rules. One login. Every model. Always in context."

## What it does

Most AI power users work across Claude, ChatGPT, DeepSeek, and Grok — but each one starts from scratch every session. Cortex is the memory layer that fixes that. You chat through Cortex, it injects your context as a system prompt on every request, and every AI already knows you.

**Core features:**
- Memory dashboard — create and manage prompts, skills, preferences, and workflow habits
- Unified chat interface with model switcher (Claude, GPT-4o, DeepSeek, Grok)
- Context compiler — assembles your active memory into a system prompt before every API call
- Save to Memory — save any AI response back into your memory profile
- Conversation history

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| State | Zustand |
| AI SDK | ai@6 + @ai-sdk/react@3 |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| Rate limiting | Upstash Redis |
| Hosting | Vercel |

**Supported models:** `claude-sonnet-4-5`, `gpt-4o`, `deepseek-chat`, `grok-3`

## Getting started

### 1. Set up Supabase

- Create a project at [supabase.com](https://supabase.com)
- Run `supabase-schema.sql` in the Supabase SQL editor
- Enable Google OAuth in the Supabase Auth dashboard

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM APIs
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
XAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the context compiler works

Before every LLM call, `lib/context-compiler.ts` loads the user's active memory items and assembles them into a structured system prompt:

```
You are a helpful AI assistant. The user has provided personal context...

## User's Skills
- ...

## User's Preferences
- ...

## User's Workflow Habits
- ...

## Custom Instructions
- ...
```

This prompt is prepended to every API call as the system message.

## Key files

```
app/api/chat/route.ts          — main LLM routing endpoint
lib/context-compiler.ts        — assembles system prompt from user memory
lib/model-router.ts            — routes requests to the correct LLM API
app/(dashboard)/chat/          — chat UI
app/(dashboard)/memory/        — memory dashboard
app/(auth)/                    — login / signup
supabase-schema.sql            — full database schema
```

## Deploy

Push to GitHub, import in Vercel, and set all environment variables from step 2 in the Vercel dashboard.
