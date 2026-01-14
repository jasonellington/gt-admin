import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Rig } from '../data/schema'

interface RigListProps {
  rigs: Rig[]
}

export function RigList({ rigs }: RigListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rigs</CardTitle>
        <CardDescription>Project containers in Gas Town</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className='text-center'>Polecats</TableHead>
              <TableHead className='text-center'>Crew</TableHead>
              <TableHead>Agents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rigs.map((rig) => (
              <TableRow key={rig.id}>
                <TableCell className='font-medium'>
                  <Link
                    to='/rigs/$rigName'
                    params={{ rigName: rig.name }}
                    className='hover:underline'
                  >
                    {rig.name}
                  </Link>
                </TableCell>
                <TableCell className='text-center'>{rig.polecatCount}</TableCell>
                <TableCell className='text-center'>{rig.crewCount}</TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {rig.agents.map((agent) => (
                      <Badge key={agent} variant='outline'>
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
