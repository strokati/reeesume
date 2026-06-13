import { db } from '@/lib/db/client';
import { applyVariables, TEMPLATE_MAP } from '@/lib/ai/prompts/templates';

export async function resolvePrompt(
  key: string,
  variables: Record<string, string>,
  userId?: string
): Promise<string> {
  const template = TEMPLATE_MAP.get(key);
  if (!template) throw new Error(`Unknown prompt key: ${key}`);

  // Check for user override if userId provided
  if (userId) {
    const override = await db.aiPromptOverride.findUnique({
      where: { userId_promptKey: { userId, promptKey: key } },
      select: { template: true },
    });
    if (override) {
      return applyVariables(override.template, variables);
    }
  }

  return applyVariables(template.defaultTemplate, variables);
}

export {
  getPromptTemplate,
  type PromptTemplate,
  getAllPromptTemplates,
  getPromptGroups,
  applyVariables,
} from '@/lib/ai/prompts/templates';
