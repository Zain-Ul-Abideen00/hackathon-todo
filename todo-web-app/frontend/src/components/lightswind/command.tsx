"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import { InputGroup, InputGroupAddon } from "./input-group"
import { TbCheck, TbSearch } from "react-icons/tb"


function Command({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn(
                "bg-popover text-popover-foreground rounded-xl! p-1 flex size-full flex-col overflow-hidden",
                className
            )}
            {...props}
        />
    )
}

function CommandDialog({
    title = "Command Palette",
    description = "Search for a command to run...",
    children,
    className,
    showCloseButton = false,
    shouldFilter = true,
    ...props
}: React.ComponentProps<typeof Dialog> & {
    title?: string
    description?: string
    className?: string
    showCloseButton?: boolean
    shouldFilter?: boolean
}) {
    return (
        <Dialog {...props}>
            <DialogHeader className="sr-only">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogContent
                className={cn(
                    "rounded-xl! top-1/3 translate-y-0 overflow-hidden p-0 sm:max-w-2xl",
                    className
                )}
                showCloseButton={showCloseButton}
            >
                <Command
                    className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground"
                    shouldFilter={shouldFilter}
                >
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function CommandInput({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div data-slot="command-input-wrapper" className="p-3 pb-0">
            <InputGroup className="bg-input/30 border-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!">
                <CommandPrimitive.Input
                    data-slot="input-group-control"
                    className={cn(
                        "w-full text-base disabled:cursor-not-allowed disabled:opacity-50 h-full border-none! shadow-none! focus:ring-0! outline-hidden!",
                        className
                    )}
                    {...props}
                />
                <InputGroupAddon>
                    <TbSearch className="size-5 shrink-0 opacity-50" />
                </InputGroupAddon>
            </InputGroup>
        </div>
    )
}

function CommandList({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={cn(
                "no-scrollbar max-h-72 scroll-py-1 outline-none overflow-x-hidden overflow-y-auto",
                className
            )}
            {...props}
        />
    )
}

function CommandEmpty({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className={cn("py-6 text-center text-sm", className)}
            {...props}
        />
    )
}

function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="command-group"
            className={cn("text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold", className)}
            {...props}
        />
    )
}

function CommandSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={cn("bg-border -mx-1 h-px", className)}
            {...props}
        />
    )
}

function CommandItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                "data-selected:bg-muted data-selected:text-foreground data-selected:*:[svg]:text-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=dialog-content]_&]:rounded-lg! group/command-item data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:cursor-pointer my-2",
                className
            )}
            {...props}
        >
            {children}
            <TbCheck className="ml-auto opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
        </CommandPrimitive.Item>
    )
}

function CommandShortcut({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="command-shortcut"
            className={cn("text-muted-foreground group-data-selected/command-item:text-foreground ml-auto text-xs tracking-widest", className)}
            {...props}
        />
    )
}

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
}
