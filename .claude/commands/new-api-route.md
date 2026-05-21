# New API Route

Scaffold a Next.js 15 Route Handler for the MasterResume app.

## Arguments

$ARGUMENTS — the API path under `src/app/api/`, e.g. `applications/[id]/export` or `ai/summarize`

## What to create

**`src/app/api/$ARGUMENTS/route.ts`**

Use this structure:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { z } from 'zod';

// Zod schema for request body validation (or searchParams)
const schema = z.object({
	// ...fields
});

export async function POST(req: NextRequest) {
	try {
		// 1. Auth guard
		const session = await auth();
		if (!session && process.env.AUTH_MODE === 'email_otp') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const userId = session?.user?.id ?? 'local-user';

		// 2. Parse + validate body
		const body = await req.json();
		const parsed = schema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
		}

		// 3. Business logic
		// ...

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[ROUTE_NAME]', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
```

## For streaming AI routes

Use the Vercel AI SDK `streamText` + `toDataStreamResponse()`:

```ts
import { streamText } from 'ai';
import { getProvider } from '@/lib/ai/providers';

export async function POST(req: NextRequest) {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { providerId, model, ...data } = await req.json();
	const aiModel = await getProvider(providerId, model);

	const result = streamText({
		model: aiModel,
		system: '...',
		prompt: '...',
	});

	return result.toDataStreamResponse();
}
```

## Conventions

- Always validate inputs with Zod — never trust raw request data.
- Always wrap in try/catch and return structured error responses.
- Log errors with a `[ROUTE_NAME]` prefix for easy filtering.
- Use streaming responses ONLY for AI routes — for everything else use `NextResponse.json`.
