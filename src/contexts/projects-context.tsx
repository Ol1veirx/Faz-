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
import type { Project, CreateProjectData, UpdateProjectData } from '@/types/project'

interface ProjectsContextType {
  projects: Project[]
  loading: boolean
  error: string | null
  create: (data: CreateProjectData) => Promise<Project>
  update: (id: string, data: UpdateProjectData) => Promise<Project>
  remove: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const create = async (data: CreateProjectData): Promise<Project> => {
    if (!user) throw new Error('Usuário não autenticado')

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    setProjects((prev) => [project, ...prev])
    return project
  }

  const update = async (id: string, data: UpdateProjectData): Promise<Project> => {
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name: data.name,
        description: data.description || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)))
    return project
  }

  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ProjectsContext.Provider value={{ projects, loading, error, create, update, remove, refetch: fetchProjects }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error('useProjects deve ser usado dentro de um ProjectsProvider')
  }
  return context
}
