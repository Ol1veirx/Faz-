import { useState } from 'react'
import { useSprints } from '@/contexts/sprints-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SprintDialog } from '@/components/sprint-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { SPRINT_STATUS_CONFIG, type Sprint, type SprintStatus } from '@/types/sprint'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'

interface SprintBarProps {
  projectId: string
  selectedSprintId: string | null
  onSelectSprint: (sprintId: string | null) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function SprintBar({ projectId, selectedSprintId, onSelectSprint }: SprintBarProps) {
  const { sprints, create, update, remove } = useSprints()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [deleteSprint, setDeleteSprint] = useState<Sprint | null>(null)

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId) ?? null

  const handleCreate = () => {
    setEditingSprint(null)
    setDialogOpen(true)
  }

  const handleEdit = () => {
    if (selectedSprint) {
      setEditingSprint(selectedSprint)
      setDialogOpen(true)
    }
  }

  const handleSubmit = async (data: { name: string; start_date: string; end_date: string; status: SprintStatus }) => {
    if (editingSprint) {
      await update(editingSprint.id, data)
    } else {
      const sprint = await create({ ...data, project_id: projectId })
      onSelectSprint(sprint.id)
    }
  }

  const handleDelete = async () => {
    if (deleteSprint) {
      await remove(deleteSprint.id)
      if (selectedSprintId === deleteSprint.id) {
        onSelectSprint(null)
      }
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />

        <Select
          value={selectedSprintId ?? '__all__'}
          onValueChange={(v) => onSelectSprint(v === '__all__' ? null : v)}
        >
          <SelectTrigger className="h-8 w-55 text-xs">
            <SelectValue placeholder="Todas as tarefas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as tarefas</SelectItem>
            {sprints.map((sprint) => {
              const config = SPRINT_STATUS_CONFIG[sprint.status]
              return (
                <SelectItem key={sprint.id} value={sprint.id}>
                  <span className="flex items-center gap-2">
                    <span>{sprint.name}</span>
                    <span className={`rounded px-1 py-0.5 text-[10px] font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {selectedSprint && (
          <span className="text-xs text-muted-foreground">
            {formatDate(selectedSprint.start_date)} — {formatDate(selectedSprint.end_date)}
          </span>
        )}

        {selectedSprint && (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => setDeleteSprint(selectedSprint)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}

        <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={handleCreate}>
          <Plus className="mr-1 h-3 w-3" />
          Sprint
        </Button>
      </div>

      <SprintDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        sprint={editingSprint}
      />

      <DeleteConfirmDialog
        open={!!deleteSprint}
        onOpenChange={(open) => !open && setDeleteSprint(null)}
        onConfirm={handleDelete}
        projectName={deleteSprint?.name ?? ''}
      />
    </>
  )
}
