export const SPRINT_STATUSES = ['planned', 'active', 'completed'] as const

export type SprintStatus = (typeof SPRINT_STATUSES)[number]

export interface Sprint {
  id: string
  project_id: string
  name: string
  start_date: string
  end_date: string
  status: SprintStatus
  created_at: string
}

export interface CreateSprintData {
  project_id: string
  name: string
  start_date: string
  end_date: string
  status?: SprintStatus
}

export interface UpdateSprintData {
  name?: string
  start_date?: string
  end_date?: string
  status?: SprintStatus
}

export const SPRINT_STATUS_CONFIG: Record<SprintStatus, { label: string; color: string }> = {
  planned: { label: 'Planejada', color: 'bg-muted text-muted-foreground' },
  active: { label: 'Ativa', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  completed: { label: 'Concluída', color: 'bg-green-500/15 text-green-700 dark:text-green-400' },
}
