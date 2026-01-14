import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { useBeads, type Bead } from './hooks/use-beads'

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'open':
      return 'default'
    case 'in_progress':
    case 'hooked':
      return 'secondary'
    case 'closed':
      return 'outline'
    case 'blocked':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getTypeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'bug':
      return 'destructive'
    case 'feature':
      return 'default'
    case 'task':
      return 'secondary'
    case 'convoy':
      return 'outline'
    default:
      return 'secondary'
  }
}

const columns: ColumnDef<Bead>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-sm'>{row.getValue('id')}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[400px] truncate font-medium' title={row.getValue('title')}>
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant={getTypeVariant(type)} className='capitalize'>
          {type}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={getStatusVariant(status)} className='capitalize'>
          {status.replace('_', ' ')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = row.getValue('priority') as number
      return (
        <span className='text-sm text-muted-foreground'>P{priority}</span>
      )
    },
  },
  {
    accessorKey: 'assignee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assignee' />
    ),
    cell: ({ row }) => {
      const assignee = row.getValue('assignee') as string | null
      return assignee ? (
        <span className='text-sm'>{assignee}</span>
      ) : (
        <span className='text-sm text-muted-foreground'>-</span>
      )
    },
  },
]

export function BeadsPage() {
  const { beads, loading, error } = useBeads()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: beads,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const typeOptions = useMemo(() => {
    const types = new Set(beads.map((b) => b.type))
    return Array.from(types).map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    }))
  }, [beads])

  const statusOptions = useMemo(() => {
    const statuses = new Set(beads.map((b) => b.status))
    return Array.from(statuses).map((status) => ({
      label: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
      value: status,
    }))
  }, [beads])

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
                <BreadcrumbPage>Beads</BreadcrumbPage>
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
              <FileText className='h-6 w-6' />
              Beads
            </h1>
            <p className='text-muted-foreground'>
              All issues and tasks tracked in the beads system
            </p>
          </div>
          <div className='text-sm text-muted-foreground'>
            {beads.length} total beads
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className='py-8 text-center text-muted-foreground'>
              Loading beads...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className='py-8 text-center text-destructive'>
              {error}
            </CardContent>
          </Card>
        ) : beads.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <FileText className='mx-auto h-12 w-12 text-muted-foreground/50' />
              <h3 className='mt-4 text-lg font-medium'>No beads found</h3>
              <p className='mt-2 text-sm text-muted-foreground'>
                Beads will appear here when created.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className='space-y-4 p-4'>
              <DataTableToolbar
                table={table}
                searchPlaceholder='Search beads...'
                filters={[
                  {
                    columnId: 'type',
                    title: 'Type',
                    options: typeOptions,
                  },
                  {
                    columnId: 'status',
                    title: 'Status',
                    options: statusOptions,
                  },
                ]}
              />
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className='h-24 text-center'
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination table={table} />
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
