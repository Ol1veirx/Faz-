import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useProjects } from '@/contexts/projects-context'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project-card'
import { ProjectDialog } from '@/components/project-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { LogOut, Plus, FolderOpen, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import TaskLogo from '../assets/task-logo.svg'
import type { Project } from '@/types/project'
import { useTheme } from '@/contexts/theme-context'

export default function DashboardPage() {
   const { user, signOut } = useAuth()
   const { projects, loading, create, update, remove } = useProjects()

   const [dialogOpen, setDialogOpen] = useState(false)
   const [editingProject, setEditingProject] = useState<Project | null>(null)
   const [deleteProject, setDeleteProject] = useState<Project | null>(null)
   const { theme } = useTheme()

   const handleCreate = () => {
      setEditingProject(null)
      setDialogOpen(true)
   }

   const handleEdit = (project: Project) => {
      setEditingProject(project)
      setDialogOpen(true)
   }

   const handleSubmit = async (data: { name: string; description: string }) => {
      if (editingProject) {
         await update(editingProject.id, data)
      } else {
         await create(data)
      }
   }

   const handleDelete = async () => {
      if (deleteProject) {
         await remove(deleteProject.id)
      }
   }

   return (
      <div className="flex min-h-screen flex-col bg-background">
         <header className="border-b">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
               <div className='flex items-center justify-center gap-2'>
                  <img src={TaskLogo} className={`w-8 h-8 ${theme === 'dark' ? 'brightness-0 invert' : 'brightness-0'}`} />
                  <h1 className="text-lg font-bold tracking-tight">Fazê</h1>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                     {user?.email}
                  </span>
                  <ThemeToggle />
                  <Button variant="ghost" size="icon" onClick={signOut}>
                     <LogOut className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         </header>

         <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
               <h2 className="text-xl font-semibold tracking-tight">Projetos</h2>
               <Button size="sm" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo projeto
               </Button>
            </div>

            {loading ? (
               <div className="flex flex-1 items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
               </div>
            ) : projects.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                     Nenhum projeto ainda.
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                     Crie seu primeiro projeto para começar.
                  </p>
               </div>
            ) : (
               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                     <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEdit}
                        onDelete={setDeleteProject}
                     />
                  ))}
               </div>
            )}
         </main>

         <ProjectDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            project={editingProject}
         />

         <DeleteConfirmDialog
            open={!!deleteProject}
            onOpenChange={(open) => !open && setDeleteProject(null)}
            onConfirm={handleDelete}
            projectName={deleteProject?.name ?? ''}
         />
      </div>
   )
}
