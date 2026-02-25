export interface Project {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
}
