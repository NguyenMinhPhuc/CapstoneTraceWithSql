"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectItem {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  items: SelectItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  showGroups?: boolean;
}

export function SearchableSelect({
  items,
  value,
  onValueChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  showGroups = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredItems, setFilteredItems] = useState<SelectItem[]>(items);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Filter items based on search value
    const filtered = items.filter((item) =>
      item.label.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchValue, items]);

  useEffect(() => {
    // Focus search input when popover opens
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open]);

  const selectedLabel = items.find((item) => item.value === value)?.label;

  // Group items by group property
  const groupedItems = showGroups
    ? filteredItems.reduce((acc, item) => {
        const groupName = item.group || "Khác";
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(item);
        return acc;
      }, {} as Record<string, SelectItem[]>)
    : {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="flex flex-col gap-2 p-2">
          {/* Search Input */}
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-2 top-2 h-4 w-4 opacity-50 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Select Items */}
          <ScrollArea className="h-[200px] border rounded">
            <div className="p-2">
              {/* "All" Option */}
              <div
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  value === "all" && "bg-accent"
                )}
                onClick={() => {
                  onValueChange("all");
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value === "all" && <Check className="h-4 w-4" />}
                </span>
                Tất cả
              </div>

              {/* Grouped or Flat Items */}
              {showGroups && Object.keys(groupedItems).length > 0
                ? Object.entries(groupedItems).map(([group, groupItems]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {group}
                      </div>
                      {groupItems.map((item) => (
                        <div
                          key={item.value}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent",
                            value === item.value && "bg-accent"
                          )}
                          onClick={() => {
                            onValueChange(item.value);
                            setOpen(false);
                            setSearchValue("");
                          }}
                        >
                          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            {value === item.value && (
                              <Check className="h-4 w-4" />
                            )}
                          </span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  ))
                : filteredItems.map((item) => (
                    <div
                      key={item.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent",
                        value === item.value && "bg-accent"
                      )}
                      onClick={() => {
                        onValueChange(item.value);
                        setOpen(false);
                        setSearchValue("");
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {value === item.value && <Check className="h-4 w-4" />}
                      </span>
                      {item.label}
                    </div>
                  ))}

              {filteredItems.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
