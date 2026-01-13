import { cn } from '@/lib/utils'

type FooterProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        'mt-auto px-4 py-4 text-center text-sm text-muted-foreground',
        '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        className
      )}
      {...props}
    >
      Powered by Gas Town v{__APP_VERSION__}
    </footer>
  )
}
