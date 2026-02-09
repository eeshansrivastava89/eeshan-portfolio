import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import type { AnalysisContent } from '@/lib/analysis'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AnalysisTableProps {
  data: AnalysisContent[]
  projectNames: Record<string, string>
  initialProjectId?: string
}

export function AnalysisTable({ data, projectNames, initialProjectId }: AnalysisTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  // Filter states
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const normalizedInitialProjectId = initialProjectId?.trim()
  const [projectFilter, setProjectFilter] = React.useState<string>(
    normalizedInitialProjectId && normalizedInitialProjectId !== 'all'
      ? normalizedInitialProjectId
      : 'all'
  )
  const [methodFilter, setMethodFilter] = React.useState<string>('all')

  // Get unique values for filters
  const uniqueProjects = React.useMemo(() => {
    const projects = new Set<string>()
    data.forEach(item => {
      if (item.projectId) projects.add(item.projectId)
    })
    return Array.from(projects).sort()
  }, [data])

  const uniqueMethods = React.useMemo(() => {
    const methods = new Set<string>()
    data.forEach(item => {
      item.methods?.forEach(m => methods.add(m))
    })
    return Array.from(methods).sort()
  }, [data])

  // Get counts for filters
  const typeCounts = React.useMemo(() => {
    const counts = { notebook: 0, post: 0 }
    data.forEach(item => {
      if (item.type === 'notebook') counts.notebook++
      else if (item.type === 'post') counts.post++
    })
    return counts
  }, [data])

  const projectCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach(item => {
      if (item.projectId) {
        counts[item.projectId] = (counts[item.projectId] || 0) + 1
      }
    })
    return counts
  }, [data])

  const methodCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach(item => {
      item.methods?.forEach(method => {
        counts[method] = (counts[method] || 0) + 1
      })
    })
    return counts
  }, [data])

  React.useEffect(() => {
    if (initialProjectId) return
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const projectParam = params.get('project')?.trim()
    if (!projectParam || projectParam === 'all') return
    if (uniqueProjects.length > 0 && !uniqueProjects.includes(projectParam)) return

    setProjectFilter(projectParam)
  }, [initialProjectId, uniqueProjects])

  // Apply filters
  React.useEffect(() => {
    const filters: ColumnFiltersState = []

    if (typeFilter !== 'all') {
      filters.push({ id: 'type', value: typeFilter })
    }
    if (projectFilter !== 'all') {
      filters.push({ id: 'projectId', value: projectFilter })
    }
    if (methodFilter !== 'all') {
      filters.push({ id: 'methods', value: methodFilter })
    }

    setColumnFilters(filters)
  }, [typeFilter, projectFilter, methodFilter])

  const columns: ColumnDef<AnalysisContent>[] = [
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => {
        const projectId = row.getValue('projectId') as string
        const isPost = row.original.type === 'post'

        if (isPost) {
          return (
            <div className="flex items-center gap-3">
              <span className="flex w-10 h-10 items-center justify-center rounded bg-[#FF6719]/10 text-[#FF6719]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </span>
              <span className="font-medium text-sm">Substack</span>
            </div>
          )
        }

        const projectName = projectNames[projectId] || projectId
        const projectImage = `/images/projects/${projectId}.png`

        return (
          <div className="flex items-center gap-3">
            <img
              src={projectImage}
              alt={projectName}
              className="w-10 h-10 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <span className="text-lg hidden">📁</span>
            <span className="font-medium text-sm">{projectName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const title = row.getValue('title') as string
        return (
          <div className="text-sm font-medium">
            {title}
          </div>
        )
      },
    },
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-foreground text-sm"
          >
            Date
            <span className="text-muted-foreground">
              {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
            </span>
          </button>
        )
      },
      cell: ({ row }) => {
        const dateValue = row.getValue('date') as Date | string | undefined
        if (!dateValue) return <span className="text-sm text-muted-foreground">—</span>

        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )
      },
    },
    {
      accessorKey: 'methods',
      header: 'Methods',
      cell: ({ row }) => {
        const methods = row.getValue('methods') as string[] | undefined
        if (!methods || methods.length === 0) return <span className="text-sm text-muted-foreground/50">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {methods.map(method => (
              <span key={method} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                {method}
              </span>
            ))}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const methods = row.getValue(id) as string[] | undefined
        return methods?.includes(value) || false
      },
    },
    {
      accessorKey: 'type',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const link = row.original.link
        const type = row.original.type
        const isSubstack = type === 'post'

        return (
          <div className="flex justify-end">
            <a
              href={link}
              target={isSubstack ? '_blank' : undefined}
              rel={isSubstack ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border transition-all whitespace-nowrap ${
                isSubstack
                  ? 'border-[#FF6719] bg-[#FF6719] text-white hover:bg-[#E55A15]'
                  : 'border-border bg-foreground text-background hover:bg-foreground/80'
              }`}
            >
              {isSubstack ? 'View on Substack' : 'View Notebook'}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return row.getValue(id) === value
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-border rounded px-3 py-1.5 bg-background hover:bg-muted/50 transition-colors"
          >
            <option value="all">All ({data.length})</option>
            <option value="notebook">📊 Notebooks ({typeCounts.notebook})</option>
            <option value="post">📮 Posts ({typeCounts.post})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Project:</label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-sm border border-border rounded px-3 py-1.5 bg-background hover:bg-muted/50 transition-colors"
          >
            <option value="all">All Projects</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>
                {projectNames[project] || project} ({projectCounts[project] || 0})
              </option>
            ))}
          </select>
        </div>

        {uniqueMethods.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Method:</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-sm border border-border rounded px-3 py-1.5 bg-background hover:bg-muted/50 transition-colors"
            >
              <option value="all">All Methods</option>
              {uniqueMethods.map(method => (
                <option key={method} value={method}>
                  {method} ({methodCounts[method] || 0})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className={`h-10 px-4 text-sm font-semibold ${header.id === 'type' ? 'w-1 whitespace-nowrap' : ''}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={`py-3 px-4 align-top ${cell.column.id === 'type' ? 'w-1 whitespace-nowrap' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {data.length} items
      </div>
    </div>
  )
}
