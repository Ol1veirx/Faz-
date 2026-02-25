import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Pencil, Trash2, UserRound, UserRoundX } from 'lucide-react'
import type { Task } from '@/types/task'
import { useAuth } from '@/contexts/auth-context'
import { useTasks } from '@/contexts/tasks-context'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function getInitials(email: string): string {
  const name = email.split('@')[0]
  return name.slice(0, 2).toUpperCase()
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { user } = useAuth()
  const { assign, unassign } = useTasks()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isAssignedToMe = task.assigned_to === user?.id

  const handleToggleAssign = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.assigned_to) {
      await unassign(task.id)
    } else {
      await assign(task.id)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group p-3 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/20' : 'hover:border-foreground/20'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <span className="text-sm leading-snug">{task.title}</span>

          {task.assigned_to && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
                  isAssignedToMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {getInitials(task.username_task ?? '')}
              </div>
              <span className="truncate text-xs text-muted-foreground">
                {isAssignedToMe ? 'Você' : (task.username_task?.split('@')[0] ?? '')}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={task.assigned_to ? 'Liberar tarefa' : 'Pegar tarefa'}
            onClick={handleToggleAssign}
          >
            {task.assigned_to ? (
              <UserRoundX className="h-3 w-3" />
            ) : (
              <UserRound className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
