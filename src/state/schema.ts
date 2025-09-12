import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  content: z.string(),
  completed: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
})

export const GroupSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  tasks: z.array(TaskSchema).optional().default([]),
})

export const ColumnSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  tasks: z.array(TaskSchema).optional().default([]),
  groups: z.array(GroupSchema).optional().default([]),
  color: z.string().optional(),
})

export const BoardSchema = z.object({
  title: z.string(),
  columns: z.array(ColumnSchema).optional().default([]),
  dataVersion: z.number().optional(),
})

export const BoardsRecordSchema = z.record(BoardSchema)

export const AppSnapshotSchema = z.object({
  version: z.number(),
  exportedAt: z.string().optional(),
  boards: BoardsRecordSchema,
  boardOrder: z.array(z.string()),
  notes: z.string().optional().default(''),
  intentions: z.array(z.string()).optional().default([]),
  topPriorities: z.array(z.string()).optional().default([]),
  // accept legacy field; map in code when importing
  pinnedPriorities: z.array(z.string()).optional().default([]),
  compactPrioritiesHidden: z.boolean().optional().default(false),
})

export type AppSnapshot = z.infer<typeof AppSnapshotSchema>

