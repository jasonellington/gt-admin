import { useState } from 'react'
import { Truck } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { ConvoyCard } from './components/convoy-card'
import { ConvoyDetailDialog } from './components/convoy-detail-dialog'
import { NewConvoyDialog } from './components/new-convoy-dialog'
import { useConvoys } from './hooks/use-convoys'

export function ConvoysPage() {
  const { convoys, loading, error, createConvoy } = useConvoys()
  const [selectedConvoyId, setSelectedConvoyId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const activeConvoys = convoys.filter((c) => c.status === 'active')
  const completedConvoys = convoys.filter((c) => c.status === 'completed')

  const handleConvoyClick = (convoyId: string) => {
    setSelectedConvoyId(convoyId)
    setDetailOpen(true)
  }

  const handleCreateConvoy = async (name: string, issues: string[]) => {
    await createConvoy(name, issues)
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Convoys
            </h1>
            <p className="text-muted-foreground">
              Track batched work across rigs
            </p>
          </div>
          <NewConvoyDialog onSubmit={handleCreateConvoy} />
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading convoys...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        ) : convoys.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No convoys yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a convoy to start tracking batched work across your rigs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Convoys */}
            {activeConvoys.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Active ({activeConvoys.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeConvoys.map((convoy) => (
                    <ConvoyCard
                      key={convoy.id}
                      convoy={convoy}
                      onClick={() => handleConvoyClick(convoy.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Convoys */}
            {completedConvoys.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
                  Completed ({completedConvoys.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedConvoys.map((convoy) => (
                    <ConvoyCard
                      key={convoy.id}
                      convoy={convoy}
                      onClick={() => handleConvoyClick(convoy.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ConvoyDetailDialog
          convoyId={selectedConvoyId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </Main>
    </>
  )
}
