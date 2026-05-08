# Cortex — Production-Grade Build Brief
> Product name: **Cortex**
> Give this entire document to Claude Code to start building.

---

## 1. Product Summary

**Cortex** is a unified AI workspace that gives users a persistent identity across all major LLMs. Instead of losing context every time you open ChatGPT, Claude, or DeepSeek, your prompts, skills, workflow habits, and preferences live in Cortex. When you chat through Cortex, your memory is automatically injected into every conversation — so every AI you use already "knows" you.

**Core value proposition:**
> "Your AI memory, your rules. One login. Every model. Always in context."

---

## 2. The Problem We're Solving

AI power users work across multiple tools — Claude, ChatGPT, DeepSeek, Grok — but each one starts from zero every session. Custom prompts, workflow preferences, skill configs, communication styles: all of it lives locally or gets re-typed manually. There is no cross-platform AI identity layer. Cortex is that layer.

---

## 3. How It Works (Technical Architecture)

```
User logs in to Cortex
        ↓
User's Memory Profile loads (prompts, skills, preferences, workflow habits)
        ↓
User types a message in the Cortex chat interface
        ↓
Context Compiler assembles the relevant memory into a system prompt
        ↓
Request is routed to the chosen LLM (Claude / GPT-4 / DeepSeek / Grok)
        ↓
Response streams back to the Cortex UI
        ↓
Conversation is saved. Key insights can be saved back to memory.
```

**The key insight:** Cortex doesn't try to read memory FROM other platforms. It IS the memory layer. Users chat through Cortex, not through ChatGPT.com directly. Cortex calls the LLM APIs under the hood and injects user context as the system prompt on every single request.

---

## 4. Full Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Streaming:** Vercel AI SDK (handles streaming responses from all LLMs cleanly)
- **Hosting:** Vercel (free tier to start)

### Backend
- **API Routes:** Next.js API routes (keep it simple, no separate backend needed for MVP)
- **Language:** TypeScript
- **LLM Routing:** Vercel AI SDK — supports OpenAI, Anthropic, and custom providers out of the box

### Database & Auth
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email + Google OAuth)
- **Vector Search:** pgvector extension on Supabase (for semantic memory retrieval later)
- **ORM:** Prisma

### Payments
- **Stripe** (when ready to monetize)

### Dev Tools
- **Claude Code** — primary coding agent
- **GitHub** — version control
- **Vercel** — deployment and preview URLs

---

## 5. Database Schema

```sql
-- Users (handled by Supabase Auth)

-- Memory Items: the core of the product
CREATE TABLE memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'prompt', 'skill', 'preference', 'workflow'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true, -- user can toggle memory on/off
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL, -- 'claude', 'gpt-4o', 'deepseek', 'grok'
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_model TEXT DEFAULT 'claude',
  memory_injection_mode TEXT DEFAULT 'auto', -- 'auto' | 'manual' | 'off'
  api_keys JSONB -- encrypted user-provided API keys
);
```

---

## 6. Core Features (MVP Scope)

### Feature 1: Memory Dashboard
- User can create, edit, delete memory items
- Each item has a type: `prompt`, `skill`, `preference`, or `workflow`
- User can toggle items active/inactive (active items get injected, inactive ones don't)
- Simple tagging system

### Feature 2: Unified Chat Interface
- Clean chat UI similar to Claude.ai or ChatGPT
- Model switcher in the top bar (Claude / GPT-4o / DeepSeek / Grok)
- Every conversation automatically loads active memory and injects it as system prompt
- Streaming responses (not waiting for full response before showing text)
- Conversation history saved to Supabase

### Feature 3: Context Compiler
This is the brain of Cortex. Before every API call:
1. Load all active memory items for the user
2. Format them into a structured system prompt:

```
You are a helpful assistant. Here is important context about the user:

[SKILLS]
- {skill_1}
- {skill_2}

[PREFERENCES]
- {preference_1}

[WORKFLOW HABITS]
- {workflow_1}

[CUSTOM PROMPTS]
- {prompt_1}

Always use this context to personalize your responses.
```

3. Prepend this to every API call as the system message

### Feature 4: Save to Memory
- After any AI response, user can click "Save to Memory"
- They pick the type (skill, preference, etc.) and a title
- It goes straight into their memory dashboard

### Feature 5: Model Router
Supports these models at launch:
- `claude-sonnet-4-5` (Anthropic)
- `gpt-4o` (OpenAI)
- `deepseek-chat` (DeepSeek)
- `grok-3` (xAI) — add after others work

---

## 7. File & Folder Structure

```
cortex/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx              ← main chat UI
│   │   │   └── [conversationId]/page.tsx
│   │   ├── memory/
│   │   │   └── page.tsx              ← memory dashboard
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── chat/route.ts             ← main LLM routing endpoint
│       ├── memory/route.ts           ← CRUD for memory items
│       └── conversations/route.ts
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ModelSwitcher.tsx
│   │   └── SaveToMemoryButton.tsx
│   ├── memory/
│   │   ├── MemoryCard.tsx
│   │   ├── MemoryForm.tsx
│   │   └── MemoryList.tsx
│   └── ui/                           ← shadcn components live here
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── context-compiler.ts           ← THE CORE: assembles system prompt
│   ├── model-router.ts               ← routes to correct LLM API
│   └── types.ts
├── prisma/
│   └── schema.prisma
└── .env.local
```

---

## 8. The Context Compiler (Core Logic)

This is the most important file in the codebase. Build this first.

```typescript
// lib/context-compiler.ts

import { createClient } from '@/lib/supabase/server'

export async function compileUserContext(userId: string): Promise<string> {
  const supabase = createClient()
  
  const { data: memoryItems } = await supabase
    .from('memory_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('type')

  if (!memoryItems || memoryItems.length === 0) {
    return ''
  }

  const grouped = {
    skill: memoryItems.filter(m => m.type === 'skill'),
    preference: memoryItems.filter(m => m.type === 'preference'),
    workflow: memoryItems.filter(m => m.type === 'workflow'),
    prompt: memoryItems.filter(m => m.type === 'prompt'),
  }

  let systemPrompt = `You are a helpful AI assistant. The user has provided personal context to personalize your responses. Always use this context.\n\n`

  if (grouped.skill.length > 0) {
    systemPrompt += `## User's Skills\n`
    grouped.skill.forEach(s => systemPrompt += `- ${s.title}: ${s.content}\n`)
    systemPrompt += '\n'
  }

  if (grouped.preference.length > 0) {
    systemPrompt += `## User's Preferences\n`
    grouped.preference.forEach(p => systemPrompt += `- ${p.title}: ${p.content}\n`)
    systemPrompt += '\n'
  }

  if (grouped.workflow.length > 0) {
    systemPrompt += `## User's Workflow Habits\n`
    grouped.workflow.forEach(w => systemPrompt += `- ${w.title}: ${w.content}\n`)
    systemPrompt += '\n'
  }

  if (grouped.prompt.length > 0) {
    systemPrompt += `## Custom Instructions\n`
    grouped.prompt.forEach(p => systemPrompt += `- ${p.content}\n`)
    systemPrompt += '\n'
  }

  return systemPrompt
}
```

---

## 9. The Chat API Route (Core Endpoint)

```typescript
// app/api/chat/route.ts

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import { compileUserContext } from '@/lib/context-compiler'

export async function POST(req: Request) {
  const { messages, model, conversationId } = await req.json()
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Compile user's memory into system prompt
  const systemPrompt = await compileUserContext(user.id)

  // Select the right LLM
  const modelProvider = getModelProvider(model)

  // Stream the response
  const result = streamText({
    model: modelProvider,
    system: systemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}

function getModelProvider(model: string) {
  switch (model) {
    case 'gpt-4o': return openai('gpt-4o')
    case 'deepseek': return openai('deepseek-chat', { baseURL: 'https://api.deepseek.com/v1' })
    case 'claude':
    default: return anthropic('claude-sonnet-4-5')
  }
}
```

---

## 10. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM APIs
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
XAI_API_KEY=your_grok_key

# App
NEXTAUTH_SECRET=your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Build Order (Step by Step)

Follow this exact order. Do not skip steps.

**Step 1: Project Setup**

You already have a folder with `git init` done. Run these commands inside your existing project folder:

```bash
npx create-next-app@latest . --typescript --tailwind --app
npx shadcn@latest init
npm install @ai-sdk/anthropic @ai-sdk/openai ai
npm install @supabase/supabase-js @supabase/ssr
npm install prisma @prisma/client
npm install zustand
```

> Note: The `.` tells Next.js to scaffold into the current folder instead of creating a new one. If it asks about existing files, choose to merge/overwrite.

**Step 2: Supabase Setup**
- Create project on supabase.com
- Run the SQL schema from Section 5
- Enable Row Level Security (RLS) on all tables
- Add RLS policies so users can only access their own data

**Step 3: Auth**
- Implement login/signup pages using Supabase Auth
- Add middleware to protect dashboard routes

**Step 4: Memory CRUD**
- Build the memory dashboard UI
- Implement API routes for create/read/update/delete memory items
- Test that memory saves and loads correctly

**Step 5: Context Compiler**
- Implement `lib/context-compiler.ts` exactly as shown above
- Write a simple test: create 3 memory items, run compiler, log output

**Step 6: Chat Interface**
- Build the chat UI (message list + input)
- Implement the `/api/chat` route with streaming
- Start with Claude only
- Verify memory is being injected (check the system prompt in logs)

**Step 7: Model Switcher**
- Add OpenAI and DeepSeek support
- Add the model switcher UI component

**Step 8: Save to Memory**
- Add "Save to Memory" button on AI responses
- Wire it to the memory API

**Step 9: Polish & Deploy**
- Add conversation history sidebar
- Deploy to Vercel
- Set environment variables in Vercel dashboard

---

## 12. Claude Code Agent Instructions

When working with Claude Code, use these instructions at the start of each session:

```
You are helping me build Cortex — a unified AI workspace with persistent 
user memory across LLMs. The tech stack is Next.js 14 (App Router), 
TypeScript, Tailwind CSS, shadcn/ui, Supabase (auth + database), 
and Vercel AI SDK for LLM routing.

The project already has git initialized. Do not run git init.

The core mechanic: user memory items are compiled into a system prompt 
and injected into every LLM API call automatically.

Current task: [describe what you're building right now]

Key files:
- lib/context-compiler.ts — assembles system prompt from user memory
- app/api/chat/route.ts — main LLM routing endpoint
- app/(dashboard)/memory/page.tsx — memory management UI
```

---

## 13. MVP Success Criteria

You have a working MVP when:
1. A user can sign up and log in
2. A user can create at least 5 memory items (mix of skills, preferences, prompts)
3. A user can open a chat, pick a model, and send a message
4. The AI response clearly reflects the user's memory (it "knows" them)
5. The conversation is saved and visible in history
6. Everything works on a deployed Vercel URL, not just localhost

---

## 14. What NOT to Build in MVP

- Mobile app (web only first)
- Browser extension
- Team/collaboration features
- Custom model fine-tuning
- Analytics dashboard
- Billing (validate first, charge later)

---

*Built for Hafsa. The product is named Cortex. Start with Step 1 in Section 11. Do not overthink. Ship.*
