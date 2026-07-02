import { vi } from 'vitest';

function createModelMock() {
  return {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  };
}

export const db = {
  user: createModelMock(),
  session: createModelMock(),
  otpCode: createModelMock(),
  masterResume: createModelMock(),
  workCompany: createModelMock(),
  workRole: createModelMock(),
  workProject: createModelMock(),
  education: createModelMock(),
  skill: createModelMock(),
  certification: createModelMock(),
  award: createModelMock(),
  project: createModelMock(),
  volunteeringRole: createModelMock(),
  publication: createModelMock(),
  vacancy: createModelMock(),
  application: createModelMock(),
  resumeDraft: createModelMock(),
  coverLetterDraft: createModelMock(),
  applicationNote: createModelMock(),
  aiProviderConfig: createModelMock(),
  aiCallLog: createModelMock(),
  aiPromptOverride: createModelMock(),
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
};

vi.mock('@/lib/db/client', () => ({ db }));
