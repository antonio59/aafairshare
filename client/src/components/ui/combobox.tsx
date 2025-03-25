import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxItem = {
  value: string
  label: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  value?: string
  onSelect: (value: string) => void
  onCreateNew?: (value: string) => void
  placeholder?: string
  createNewLabel?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  items,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Select an item",
  createNewLabel = "Create new",
  emptyMessage = "No item found.",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const selectedItem = React.useMemo(
    () => items.find((item) => item.value === value),
    [items, value]
  )

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    const lowerSearchQuery = searchQuery.toLowerCase()
    
    // First look for an exact match
    const exactMatches = items.filter((item) => 
      item.label.toLowerCase() === lowerSearchQuery
    )
    
    if (exactMatches.length > 0) {
      return exactMatches
    }
    
    // Then look for a starting-with match 
    const startingMatches = items.filter((item) => 
      item.label.toLowerCase().startsWith(lowerSearchQuery)
    )
    
    if (startingMatches.length > 0) {
      return startingMatches
    }
    
    // Finally fall back to includes match
    return items.filter((item) => 
      item.label.toLowerCase().includes(lowerSearchQuery)
    )
  }, [items, searchQuery])

  // Check if we have an exact match
  const exactMatch = React.useMemo(() => {
    if (!searchQuery) return null;
    return items.find(
      (item) => item.label.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [items, searchQuery]);
  
  // Only show create new when there's no exact match
  const showCreateNew = React.useMemo(() => {
    return (
      onCreateNew && 
      searchQuery && 
      !exactMatch
    )
  }, [exactMatch, onCreateNew, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    onSelect(item.value)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            
            {showCreateNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      if (onCreateNew) {
                        onCreateNew(searchQuery)
                        setOpen(false)
                        setSearchQuery("")
                      }
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createNewLabel}: <span className="font-medium">{searchQuery}</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}