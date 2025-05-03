"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/app/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover"

type ComboboxOption = {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    buttonClassName?: string
    popoverClassName?: string
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No option found.",
    className,
    buttonClassName,
    popoverClassName,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className={cn("relative", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("justify-between", buttonClassName)}
                    >
                        {value
                            ? options.find((option) => option.value === value)?.label
                            : placeholder}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("p-0", popoverClassName)}>
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} className="h-9" />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        {option.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
