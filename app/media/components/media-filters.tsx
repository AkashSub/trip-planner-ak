import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterOptions } from '../types'

interface MediaFiltersProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  availableTags: string[]
  availableUploaders: string[]
  availablePersonTags: string[]
}

export function MediaFilters({
  filters,
  onFilterChange,
  availableTags,
  availableUploaders,
  availablePersonTags,
}: MediaFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.uploader || undefined}
        onValueChange={(value) =>
          onFilterChange({ ...filters, uploader: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by uploader" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All uploaders</SelectItem>
          {availableUploaders.map((uploader) => (
            <SelectItem key={uploader} value={uploader}>
              {uploader}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tags[0] || undefined}
        onValueChange={(value) =>
          onFilterChange({ ...filters, tags: value === "all" ? [] : [value] })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {availableTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.personTags[0] || undefined}
        onValueChange={(value) =>
          onFilterChange({ ...filters, personTags: value === "all" ? [] : [value] })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by person" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All people</SelectItem>
          {availablePersonTags.map((person) => (
            <SelectItem key={person} value={person}>
              {person}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}