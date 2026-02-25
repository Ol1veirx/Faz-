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
import type { Sprint, CreateSprintData, UpdateSprintData, SprintStatus } from '@/types/sprint'

interface SprintsContextType {
  sprints: Sprint[]
  loading: boolean
  error: string | null
  activeSprint: Sprint | null
  create: (data: CreateSprintData) => Promise<Sprint>
  update: (id: string, data: UpdateSprintData) => Promise<Sprint>
  updateStatus: (id: string, status: SprintStatus) => Promise<Sprint>
  remove: (id: string) => Promise<void>
  refetch: () => Promise<void>
  setProjectId: (projectId: string | null) => void
}

const SprintsContext = createContext<SprintsContextType | undefined>(undefined)

export function SprintsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeSprint = sprints.find((s) => s.status === 'active') ?? null

  const fetchSprints = useCallback(async () => {
    if (!user || !projectId) {
      setSprints([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true })

      if (error) throw error
      setSprints(data as Sprint[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sprints')
    } finally {
      setLoading(false)
    }
  }, [user, projectId])

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  const create = async (data: CreateSprintData): Promise<Sprint> => {
    if (!user) throw new Error('Usuário não autenticado')

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        project_id: data.project_id,
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status || 'planned',
      })
      .select()
      .single()

    if (error) throw error
    setSprints((prev) => [...prev, sprint as Sprint])
    return sprint as Sprint
  }

  const update = async (id: string, data: UpdateSprintData): Promise<Sprint> => {
    const updatePayload: Record<string, unknown> = {}
    if (data.name !== undefined) updatePayload.name = data.name
    if (data.start_date !== undefined) updatePayload.start_date = data.start_date
    if (data.end_date !== undefined) updatePayload.end_date = data.end_date
    if (data.status !== undefined) updatePayload.status = data.status

    const { data: sprint, error } = await supabase
      .from('sprints')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setSprints((prev) => prev.map((s) => (s.id === id ? (sprint as Sprint) : s)))
    return sprint as Sprint
  }

  const updateStatus = async (id: string, status: SprintStatus): Promise<Sprint> => {
    return update(id, { status })
  }

  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', id)

    if (error) throw error
    setSprints((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <SprintsContext.Provider
      value={{ sprints, loading, error, activeSprint, create, update, updateStatus, remove, refetch: fetchSprints, setProjectId }}
    >
      {children}
    </SprintsContext.Provider>
  )
}

export function useSprints() {
  const context = useContext(SprintsContext)
  if (context === undefined) {
    throw new Error('useSprints deve ser usado dentro de um SprintsProvider')
  }
  return context
}
