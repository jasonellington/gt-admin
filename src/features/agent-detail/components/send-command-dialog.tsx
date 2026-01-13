import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SendCommandDialogProps {
  onSend: (command: string) => void
  disabled?: boolean
}

export function SendCommandDialog({ onSend, disabled }: SendCommandDialogProps) {
  const [open, setOpen] = useState(false)
  const [command, setCommand] = useState('')

  const handleSend = () => {
    if (command.trim()) {
      onSend(command.trim())
      setCommand('')
      setOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant='outline'>
          <Send className='mr-2 h-4 w-4' />
          Send Command
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Send Command</DialogTitle>
          <DialogDescription>
            Send a command to the agent's tmux session. The command will be
            executed as if typed in the terminal.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='command'>Command</Label>
            <Input
              id='command'
              placeholder='e.g., gt status'
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className='font-mono'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!command.trim()}>
            <Send className='mr-2 h-4 w-4' />
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
