import * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  )
}

/* -----------------------------------------------------------------------------
 * Text Skeleton
 * -------------------------------------------------------------------------- */

type TextSkeletonProps = React.ComponentProps<'div'> & {
  /** Width of the text skeleton (default: random between 60-90%) */
  width?: string
}

function TextSkeleton({ className, width, ...props }: TextSkeletonProps) {
  const randomWidth = React.useMemo(() => {
    return width ?? `${Math.floor(Math.random() * 30) + 60}%`
  }, [width])

  return (
    <Skeleton
      data-slot='text-skeleton'
      className={cn('h-4', className)}
      style={{ width: randomWidth }}
      {...props}
    />
  )
}

/* -----------------------------------------------------------------------------
 * Avatar Skeleton
 * -------------------------------------------------------------------------- */

type AvatarSkeletonProps = React.ComponentProps<'div'> & {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

function AvatarSkeleton({
  className,
  size = 'md',
  ...props
}: AvatarSkeletonProps) {
  return (
    <Skeleton
      data-slot='avatar-skeleton'
      className={cn(
        'rounded-full',
        size === 'sm' && 'size-8',
        size === 'md' && 'size-10',
        size === 'lg' && 'size-12',
        className
      )}
      {...props}
    />
  )
}

/* -----------------------------------------------------------------------------
 * Card Skeleton
 * -------------------------------------------------------------------------- */

type CardSkeletonProps = React.ComponentProps<'div'> & {
  /** Show header area with title and description */
  showHeader?: boolean
  /** Show action button in header */
  showAction?: boolean
  /** Number of content lines to show */
  contentLines?: number
  /** Show footer area */
  showFooter?: boolean
}

function CardSkeleton({
  className,
  showHeader = true,
  showAction = false,
  contentLines = 3,
  showFooter = false,
  ...props
}: CardSkeletonProps) {
  return (
    <div
      data-slot='card-skeleton'
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 shadow-sm',
        className
      )}
      {...props}
    >
      {showHeader && (
        <div className='flex items-start justify-between gap-4 px-6'>
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-5 w-1/3' />
            <Skeleton className='h-4 w-2/3' />
          </div>
          {showAction && <Skeleton className='h-9 w-20' />}
        </div>
      )}
      <div className='space-y-3 px-6'>
        {Array.from({ length: contentLines }).map((_, i) => (
          <TextSkeleton key={i} />
        ))}
      </div>
      {showFooter && (
        <div className='flex items-center gap-2 px-6'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-24' />
        </div>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * List Item Skeleton
 * -------------------------------------------------------------------------- */

type ListItemSkeletonProps = React.ComponentProps<'div'> & {
  /** Show avatar/icon */
  showAvatar?: boolean
  /** Show secondary text line */
  showSecondary?: boolean
  /** Show trailing action */
  showAction?: boolean
}

function ListItemSkeleton({
  className,
  showAvatar = true,
  showSecondary = true,
  showAction = false,
  ...props
}: ListItemSkeletonProps) {
  return (
    <div
      data-slot='list-item-skeleton'
      className={cn('flex items-center gap-4 py-3', className)}
      {...props}
    >
      {showAvatar && <AvatarSkeleton size='md' />}
      <div className='flex-1 space-y-2'>
        <TextSkeleton width='40%' />
        {showSecondary && <TextSkeleton width='60%' className='h-3' />}
      </div>
      {showAction && <Skeleton className='h-8 w-8 rounded-md' />}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * List Skeleton
 * -------------------------------------------------------------------------- */

type ListSkeletonProps = React.ComponentProps<'div'> & {
  /** Number of items to show */
  count?: number
  /** Props to pass to each ListItemSkeleton */
  itemProps?: Omit<ListItemSkeletonProps, 'className'>
}

function ListSkeleton({
  className,
  count = 5,
  itemProps,
  ...props
}: ListSkeletonProps) {
  return (
    <div
      data-slot='list-skeleton'
      className={cn('divide-y', className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} {...itemProps} />
      ))}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * Table Row Skeleton
 * -------------------------------------------------------------------------- */

type TableRowSkeletonProps = React.ComponentProps<'tr'> & {
  /** Number of columns */
  columns?: number
  /** Show checkbox column */
  showCheckbox?: boolean
  /** Show actions column */
  showActions?: boolean
}

function TableRowSkeleton({
  className,
  columns = 4,
  showCheckbox = false,
  showActions = false,
  ...props
}: TableRowSkeletonProps) {
  return (
    <tr
      data-slot='table-row-skeleton'
      className={cn('border-b', className)}
      {...props}
    >
      {showCheckbox && (
        <td className='p-2'>
          <Skeleton className='size-4' />
        </td>
      )}
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className='p-2'>
          <TextSkeleton width={i === 0 ? '30%' : undefined} />
        </td>
      ))}
      {showActions && (
        <td className='p-2'>
          <Skeleton className='ml-auto h-8 w-8' />
        </td>
      )}
    </tr>
  )
}

/* -----------------------------------------------------------------------------
 * Table Skeleton
 * -------------------------------------------------------------------------- */

type TableSkeletonProps = React.ComponentProps<'div'> & {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
  /** Show checkbox column */
  showCheckbox?: boolean
  /** Show actions column */
  showActions?: boolean
  /** Show table header */
  showHeader?: boolean
}

function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showCheckbox = false,
  showActions = false,
  showHeader = true,
  ...props
}: TableSkeletonProps) {
  return (
    <div
      data-slot='table-skeleton'
      className={cn('overflow-hidden rounded-md border', className)}
      {...props}
    >
      <div className='relative w-full overflow-x-auto'>
        <table className='w-full caption-bottom text-sm'>
          {showHeader && (
            <thead className='[&_tr]:border-b'>
              <tr className='border-b'>
                {showCheckbox && (
                  <th className='h-10 px-2'>
                    <Skeleton className='size-4' />
                  </th>
                )}
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className='h-10 px-2 text-start'>
                    <Skeleton className='h-4 w-20' />
                  </th>
                ))}
                {showActions && <th className='h-10 w-10 px-2' />}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton
                key={i}
                columns={columns}
                showCheckbox={showCheckbox}
                showActions={showActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * Data Fetching Skeleton
 * A flexible skeleton wrapper for data fetching states
 * -------------------------------------------------------------------------- */

type DataFetchingSkeletonProps = React.ComponentProps<'div'> & {
  /** Type of skeleton to render */
  variant: 'card' | 'table' | 'list' | 'custom'
  /** Number of items (for card grid or list) */
  count?: number
  /** Props for card variant */
  cardProps?: Omit<CardSkeletonProps, 'className'>
  /** Props for table variant */
  tableProps?: Omit<TableSkeletonProps, 'className'>
  /** Props for list variant */
  listProps?: Omit<ListSkeletonProps, 'className'>
  /** Custom skeleton content */
  children?: React.ReactNode
}

function DataFetchingSkeleton({
  className,
  variant,
  count = 3,
  cardProps,
  tableProps,
  listProps,
  children,
  ...props
}: DataFetchingSkeletonProps) {
  return (
    <div
      data-slot='data-fetching-skeleton'
      className={cn(className)}
      {...props}
    >
      {variant === 'card' && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} {...cardProps} />
          ))}
        </div>
      )}
      {variant === 'table' && <TableSkeleton {...tableProps} />}
      {variant === 'list' && <ListSkeleton count={count} {...listProps} />}
      {variant === 'custom' && children}
    </div>
  )
}

export {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  DataFetchingSkeleton,
}
