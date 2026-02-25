import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { useProjects } from '@/contexts/projects-context'
import { useTasks } from '@/contexts/tasks-context'
import { KanbanBoard } from '@/components/kanban-board'
import { TaskDialog } from '@/components/task-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut, Plus, Loader2 } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { projects } = useProjects()
  const { loading, create, update, remove, setProjectId } = useTasks()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)

  const project = projects.find((p) => p.id === id)

  useEffect(() => {
    if (id) setProjectId(id)
    return () => setProjectId(null)
  }, [id, setProjectId])

  const handleCreate = () => {
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: { title: string; status: TaskStatus }) => {
    if (editingTask) {
      await update(editingTask.id, data)
    } else {
      await create({ ...data, project_id: id! })
    }
  }

  const handleDelete = async () => {
    if (deleteTask) {
      await remove(deleteTask.id)
    }
  }

  if (!project && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Projeto não encontrado.</p>
          <Button variant="link" onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight">
              {project?.name ?? 'Carregando...'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Tarefas</h2>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova tarefa
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <KanbanBoard onEdit={handleEdit} onDelete={setDeleteTask} />
        )}
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        task={editingTask}
      />

      <DeleteConfirmDialog
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
        onConfirm={handleDelete}
        projectName={deleteTask?.title ?? ''}
      />
    </div>
  )
}
