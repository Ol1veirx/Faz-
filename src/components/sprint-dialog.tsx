import { useEffect, useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { SPRINT_STATUSES, SPRINT_STATUS_CONFIG, type Sprint, type SprintStatus } from '@/types/sprint'

interface SprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; start_date: string; end_date: string; status: SprintStatus }) => Promise<void>
  sprint?: Sprint | null
}

export function SprintDialog({ open, onOpenChange, onSubmit, sprint }: SprintDialogProps) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<SprintStatus>('planned')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!sprint

  useEffect(() => {
    if (open) {
      setName(sprint?.name ?? '')
      setStartDate(sprint?.start_date ?? '')
      setEndDate(sprint?.end_date ?? '')
      setStatus(sprint?.status ?? 'planned')
      setError('')
    }
  }, [open, sprint])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (endDate < startDate) {
      setError('A data de término deve ser posterior à data de início.')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        status,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar sprint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar sprint' : 'Nova sprint'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da sprint.'
              : 'Defina o período e o nome da sprint.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprint-name">Nome</Label>
            <Input
              id="sprint-name"
              placeholder="Ex: Sprint 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sprint-start">Início</Label>
              <Input
                id="sprint-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprint-end">Término</Label>
              <Input
                id="sprint-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as SprintStatus)}>
              <SelectTrigger id="sprint-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPRINT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SPRINT_STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
