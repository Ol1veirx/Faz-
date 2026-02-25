import { useCallback, useEffect, useState } from 'react'
import type { Project, CreateProjectData, UpdateProjectData } from '@/types/project'
import * as projectsService from '@/services/projects'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectsService.getProjects()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const create = async (data: CreateProjectData) => {
    const project = await projectsService.createProject(data)
    setProjects((prev) => [project, ...prev])
    return project
  }

  const update = async (id: string, data: UpdateProjectData) => {
    const project = await projectsService.updateProject(id, data)
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)))
    return project
  }

  const remove = async (id: string) => {
    await projectsService.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return { projects, loading, error, create, update, remove, refetch: fetchProjects }
}
