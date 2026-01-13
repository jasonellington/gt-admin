import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface NewConvoyDialogProps {
  onSubmit: (name: string, issues: string[]) => Promise<void>
}

export function NewConvoyDialog({ onSubmit }: NewConvoyDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [issueInput, setIssueInput] = useState('')
  const [issues, setIssues] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddIssue = () => {
    const trimmed = issueInput.trim()
    if (trimmed && !issues.includes(trimmed)) {
      setIssues([...issues, trimmed])
      setIssueInput('')
    }
  }

  const handleRemoveIssue = (issue: string) => {
    setIssues(issues.filter((i) => i !== issue))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSubmit(name.trim(), issues)
      setOpen(false)
      setName('')
      setIssues([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create convoy')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddIssue()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Convoy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Convoy</DialogTitle>
          <DialogDescription>
            Create a convoy to track related issues across rigs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Deploy v2.0"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues">Issues (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="issues"
                placeholder="e.g., gt-abc"
                value={issueInput}
                onChange={(e) => setIssueInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="secondary" onClick={handleAddIssue}>
                Add
              </Button>
            </div>
            {issues.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {issues.map((issue) => (
                  <Badge key={issue} variant="secondary" className="gap-1">
                    {issue}
                    <button
                      type="button"
                      onClick={() => handleRemoveIssue(issue)}
                      className="ml-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Convoy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
