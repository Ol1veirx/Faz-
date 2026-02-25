import { supabase } from '@/lib/supabase'
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project'

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProject(project: CreateProjectData): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: project.name,
      description: project.description || null,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, project: UpdateProjectData): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      name: project.name,
      description: project.description || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
