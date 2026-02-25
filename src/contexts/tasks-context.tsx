import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types/task'

interface TasksContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  create: (data: CreateTaskData) => Promise<Task>
  update: (id: string, data: UpdateTaskData) => Promise<Task>
  updateStatus: (id: string, status: TaskStatus) => Promise<Task>
  remove: (id: string) => Promise<void>
  refetch: () => Promise<void>
  setProjectId: (projectId: string | null) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!user || !projectId) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTasks(data as Task[])
    } catch (err) {
      console.log("Error:", err instanceof Error ? err.message : 'Erro')
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas')
    } finally {
      setLoading(false)
    }
  }, [user, projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const create = async (data: CreateTaskData): Promise<Task> => {
    if (!user) throw new Error('Usuário não autenticado')

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        project_id: data.project_id,
        status: data.status || 'pendente',
        assigned_to: data.assigned_to || null,
        sprint_id: data.sprint_id || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    setTasks((prev) => [...prev, task as Task])
    return task as Task
  }

  const update = async (id: string, data: UpdateTaskData): Promise<Task> => {
    const updatePayload: Record<string, unknown> = {}
    if (data.title !== undefined) updatePayload.title = data.title
    if (data.status !== undefined) updatePayload.status = data.status
    if (data.assigned_to !== undefined) updatePayload.assigned_to = data.assigned_to
    if (data.sprint_id !== undefined) updatePayload.sprint_id = data.sprint_id

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setTasks((prev) => prev.map((t) => (t.id === id ? (task as Task) : t)))
    return task as Task
  }

  const updateStatus = async (id: string, status: TaskStatus): Promise<Task> => {
    return update(id, { status })
  }

  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <TasksContext.Provider
      value={{ tasks, loading, error, create, update, updateStatus, remove, refetch: fetchTasks, setProjectId }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error('useTasks deve ser usado dentro de um TasksProvider')
  }
  return context
}
