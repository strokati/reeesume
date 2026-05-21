# New AI Operation

Add a complete AI-powered feature: prompt template + streaming API route + client hook.

## Arguments

$ARGUMENTS — the operation name and purpose, e.g. `rephrase-bullet - AI rephrase a single resume bullet point`

## Steps to follow

### 1. Create the operation module `src/lib/ai/operations/[name].ts`

```ts
// src/lib/ai/operations/rephrase-bullet.ts
import { streamText, StreamTextResult } from 'ai';
import { getProvider } from '@/lib/ai/providers';

export interface RephraseBulletInput {
	original: string;
	direction: 'stronger' | 'concise' | 'quantified';
	context?: string; // optional: job title or target role
}

const SYSTEM_PROMPT = `You are an expert resume writer. You rephrase resume bullet points to be more impactful.
- Use strong action verbs
- Be specific and quantify where possible
- Keep it to 1-2 lines
- Return ONLY the rephrased text, no explanation`;

export async function rephraseBullet(
	input: RephraseBulletInput,
	providerId: string,
	model: string,
): Promise<StreamTextResult<any>> {
	const aiModel = await getProvider(providerId, model);

	return streamText({
		model: aiModel,
		system: SYSTEM_PROMPT,
		prompt: `Direction: ${input.direction}\n\nOriginal: ${input.original}${input.context ? `\n\nTarget role: ${input.context}` : ''}`,
	});
}
```

### 2. Create the API route `src/app/api/ai/[operation-name]/route.ts`

```ts
// src/app/api/ai/rephrase-bullet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { z } from 'zod';
import { rephraseBullet } from '@/lib/ai/operations/rephrase-bullet';

const schema = z.object({
	original: z.string().min(1),
	direction: z.enum(['stronger', 'concise', 'quantified']),
	context: z.string().optional(),
	providerId: z.string().min(1),
	model: z.string().min(1),
});

export async function POST(req: NextRequest) {
	try {
		const session = await auth();
		if (!session && process.env.AUTH_MODE === 'email_otp') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const parsed = schema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}

		const { providerId, model, ...input } = parsed.data;
		const result = await rephraseBullet(input, providerId, model);
		return result.toDataStreamResponse();
	} catch (error) {
		console.error('[AI/REPHRASE_BULLET]', error);
		return NextResponse.json({ error: 'AI operation failed' }, { status: 500 });
	}
}
```

### 3. Create the client hook `src/hooks/use-[operation-name].ts`

```ts
// src/hooks/use-rephrase-bullet.ts
import { useCompletion } from 'ai/react';
import { useState } from 'react';

export function useRephraseBullet() {
	const [result, setResult] = useState<string>('');

	const { complete, isLoading, error } = useCompletion({
		api: '/api/ai/rephrase-bullet',
		onFinish: (_prompt, completion) => setResult(completion),
	});

	const rephrase = async (
		original: string,
		direction: 'stronger' | 'concise' | 'quantified',
		providerId: string,
		model: string,
		context?: string,
	) => {
		setResult('');
		await complete('', {
			body: { original, direction, context, providerId, model },
		});
	};

	return { rephrase, result, isLoading, error };
}
```

## Notes

- `useCompletion` is for single-turn text generation. Use `useChat` for multi-turn conversations.
- Always pass `providerId` and `model` from the user's selected config (not hardcoded).
- Show a disabled state / "Configure AI provider" message when no provider is set up.
- Log every AI call to `AiCallLog` table for transparency (add to the operation module).
