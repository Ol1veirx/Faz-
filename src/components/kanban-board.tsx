import { useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanColumn } from '@/components/kanban-column'
import { Card } from '@/components/ui/card'
import { GripVertical } from 'lucide-react'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task'
import { useTasks } from '@/contexts/tasks-context'

interface KanbanBoardProps {
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  sprintId?: string | null
}

export function KanbanBoard({ onEdit, onDelete, sprintId }: KanbanBoardProps) {
  const { tasks, updateStatus } = useTasks()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const filteredTasks = useMemo(() => {
    if (sprintId === null || sprintId === undefined) return tasks
    return tasks.filter((t) => t.sprint_id === sprintId)
  }, [tasks, sprintId])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pendente: [],
      'em andamento': [],
      concluída: [],
    }
    for (const task of filteredTasks) {
      const status = task.status as TaskStatus
      if (grouped[status]) {
        grouped[status].push(task)
      }
    }
    return grouped
  }, [filteredTasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined
    setActiveTask(task ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const task = active.data.current?.task as Task | undefined
    if (!task) return

    // O over.id pode ser o id de uma coluna (status) ou de outra task
    let targetStatus: TaskStatus | null = null

    // Verificar se soltou direto na coluna
    if (TASK_STATUSES.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus
    } else {
      // Soltou sobre outra task — descobrir em qual coluna ela está
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) {
        targetStatus = overTask.status
      }
    }

    if (targetStatus && targetStatus !== task.status) {
      updateStatus(task.id, targetStatus)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <Card className="p-3 shadow-lg ring-2 ring-primary/20">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground/50" />
              <span className="flex-1 text-sm leading-snug">{activeTask.title}</span>
            </div>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  )
}
