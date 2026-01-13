import { Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SendCommandDialog } from './send-command-dialog'

interface ActionButtonsProps {
  sessionConnected: boolean
  onStart: () => void
  onStop: () => void
  onSendCommand: (command: string) => void
}

export function ActionButtons({
  sessionConnected,
  onStart,
  onStop,
  onSendCommand,
}: ActionButtonsProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        disabled={sessionConnected}
        variant={sessionConnected ? 'outline' : 'default'}
        onClick={onStart}
      >
        <Play className='mr-2 h-4 w-4' />
        Start
      </Button>
      <Button
        disabled={!sessionConnected}
        variant={sessionConnected ? 'destructive' : 'outline'}
        onClick={onStop}
      >
        <Square className='mr-2 h-4 w-4' />
        Stop
      </Button>
      <SendCommandDialog
        disabled={!sessionConnected}
        onSend={onSendCommand}
      />
    </div>
  )
}
