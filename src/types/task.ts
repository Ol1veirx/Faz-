export const TASK_STATUSES = ['pendente', 'em andamento', 'concluída'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Task {
  id: string
  project_id: string
  title: string
  status: TaskStatus
  assigned_to: string | null
  username_task:  string | null
  user_id: string
  sprint_id: string | null
  created_at: string
}

export interface CreateTaskData {
  title: string
  project_id: string
  status?: TaskStatus
  assigned_to?: string
  sprint_id?: string | null
}

export interface UpdateTaskData {
  title?: string
  status?: TaskStatus
  assigned_to?: string | null
  username_task?: string | null
  sprint_id?: string | null
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400' },
  'em andamento': { label: 'Em andamento', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  concluída: { label: 'Concluída', color: 'bg-green-500/15 text-green-700 dark:text-green-400' },
}
