import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Send, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type Message = {
  id: string
  sender: 'user' | 'mayor'
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'mayor',
    content: 'Welcome! I\'m the Mayor, your AI assistant for managing tasks and coordinating work. How can I help you today?',
    timestamp: new Date(Date.now() - 3600000),
  },
]

export function Mayor() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [newMessage, ...prev])
    setInputValue('')

    // Simulate Mayor response
    setTimeout(() => {
      const mayorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'mayor',
        content: 'Thank you for your message. I\'m processing your request and will coordinate the necessary tasks.',
        timestamp: new Date(),
      }
      setMessages((prev) => [mayorResponse, ...prev])
    }, 1000)
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/'>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Mayor</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex items-center gap-4 border-b pb-4'>
            <Avatar className='size-12'>
              <AvatarImage src='/avatars/mayor.jpg' alt='Mayor' />
              <AvatarFallback className='bg-primary text-primary-foreground'>
                <Crown className='size-6' />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Mayor</h1>
              <p className='text-sm text-muted-foreground'>
                Your AI assistant for task coordination
              </p>
            </div>
          </div>

          {/* Chat Area */}
          <div className='flex flex-1 flex-col overflow-hidden pt-4'>
            <ScrollArea className='flex-1 pr-4'>
              <div className='flex flex-col-reverse gap-4 pb-4'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-3',
                      message.sender === 'user'
                        ? 'self-end bg-primary text-primary-foreground'
                        : 'self-start bg-muted'
                    )}
                  >
                    <p className='text-sm'>{message.content}</p>
                    <span
                      className={cn(
                        'mt-1 block text-xs',
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {format(message.timestamp, 'h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className='flex gap-2 border-t pt-4'
            >
              <label className='flex-1'>
                <span className='sr-only'>Message the Mayor</span>
                <input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder='Type your message...'
                  className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                />
              </label>
              <Button type='submit' size='icon'>
                <Send className='size-4' />
                <span className='sr-only'>Send message</span>
              </Button>
            </form>
          </div>
        </section>
      </Main>
    </>
  )
}
