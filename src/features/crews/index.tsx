import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Users,
  Circle,
  GitBranch,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Play,
  Square,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface CrewMember {
  name: string
  rig: string
  branch: string
  path: string
  hasSession: boolean
  gitClean: boolean
  currentTask: string | null
}

const API_URL = 'http://localhost:3001/api/crew'

export function CrewsPage() {
  const navigate = useNavigate()
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCrew = useCallback(async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCrew(data)
      setError(null)
    } catch {
      setError('Failed to fetch crew members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCrew()
    const interval = setInterval(fetchCrew, 5000)
    return () => clearInterval(interval)
  }, [fetchCrew])

  const handleRowClick = (member: CrewMember) => {
    navigate({
      to: '/rigs/$rigId/crew/$crewId',
      params: { rigId: member.rig, crewId: member.name },
    })
  }

  const onlineCount = crew.filter((c) => c.hasSession).length
  const cleanCount = crew.filter((c) => c.gitClean).length

  return (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/town'>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Crew</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
              <Users className='h-6 w-6' />
              Crew Members
            </h1>
            <p className='text-muted-foreground'>
              All crew members across all rigs
            </p>
          </div>
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Circle className='h-3 w-3 fill-emerald-500 text-emerald-500' />
              {onlineCount} online
            </span>
            <span className='flex items-center gap-1'>
              <CheckCircle2 className='h-3 w-3 text-emerald-500' />
              {cleanCount} clean
            </span>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className='py-8 text-center text-muted-foreground'>
              Loading crew members...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className='py-8 text-center text-destructive'>
              {error}
            </CardContent>
          </Card>
        ) : crew.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <Users className='mx-auto h-12 w-12 text-muted-foreground/50' />
              <h3 className='mt-4 text-lg font-medium'>No crew members</h3>
              <p className='mt-2 text-sm text-muted-foreground'>
                No crew members found across any rigs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Git Status</TableHead>
                  <TableHead>Current Task</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crew.map((member) => (
                  <TableRow
                    key={`${member.rig}-${member.name}`}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => handleRowClick(member)}
                  >
                    <TableCell className='font-medium'>{member.name}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{member.rig}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Circle
                          className={cn(
                            'h-2 w-2 fill-current',
                            member.hasSession
                              ? 'text-emerald-500'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm',
                            member.hasSession
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          )}
                        >
                          {member.hasSession ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 font-mono text-sm'>
                        <GitBranch className='h-3 w-3' />
                        {member.branch}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.gitClean ? (
                        <div className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                          <CheckCircle2 className='h-4 w-4' />
                          <span className='text-sm'>Clean</span>
                        </div>
                      ) : (
                        <div className='flex items-center gap-1 text-amber-600 dark:text-amber-400'>
                          <XCircle className='h-4 w-4' />
                          <span className='text-sm'>Dirty</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.currentTask ? (
                        <Badge variant='secondary'>{member.currentTask}</Badge>
                      ) : (
                        <span className='text-sm text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div
                        className='flex items-center justify-end gap-2'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRowClick(member)}
                        >
                          <MessageSquare className='mr-1 h-4 w-4' />
                          Chat
                        </Button>
                        {member.hasSession ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-destructive hover:text-destructive'
                          >
                            <Square className='mr-1 h-4 w-4' />
                            Stop
                          </Button>
                        ) : (
                          <Button variant='ghost' size='sm'>
                            <Play className='mr-1 h-4 w-4' />
                            Start
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Main>
    </>
  )
}
