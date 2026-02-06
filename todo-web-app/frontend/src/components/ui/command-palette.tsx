"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    TbCalendar as Calendar,
    TbCheck as Check,
    TbCircle as Circle,
    TbCommand as CommandIcon,
    TbPlus as Plus,
    TbSearch as Search,
    TbKeyboard,
} from "react-icons/tb";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/lightswind/command";
import { useDebounce } from "@/hooks/useDebounce";
import { getTasks } from "@/lib/api/tasks";
import type { Task } from "@/types/task";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const { data: tasks, isLoading } = useQuery({
        queryKey: ["tasks", "search", debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) return [];
            // use getTasks instead of manual fetch to handle user_id and params
            return getTasks({
                search: debouncedSearch,
                limit: 5
            }).then((r) => r.data);
        },
        enabled: open && debouncedSearch.length > 0,
        retry: 0,
        staleTime: 5000,
    });

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-input bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:bg-primary/5 hover:border-primary/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:w-64 hover:cursor-pointer"
            >
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <span className="hidden sm:inline-flex">Search tasks...</span>
                <span className="inline-flex sm:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-sm font-medium text-muted-foreground opacity-100 sm:flex">
                    <CommandIcon className="h-5 w-5" />K
                </kbd>
            </button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                shouldFilter={false}
                className="bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden rounded-xl sm:max-w-2xl"
            >
                {/* Mac-style Header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-3 select-none">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm transition-transform hover:scale-110" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-sm transition-transform hover:scale-110" />
                        <div className="h-3 w-3 rounded-full bg-green-500/80 shadow-sm transition-transform hover:scale-110" />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground/70 tracking-wide uppercase">
                        Search
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                        <TbKeyboard className="h-3.5 w-3.5" />
                        <span className="font-mono text-[10px] border rounded px-1 min-w-[20px] text-center bg-background/50">ESC</span>
                    </div>
                </div>

                <CommandInput
                    placeholder="Search tasks..."
                    value={search}
                    onValueChange={setSearch}
                    className="border-none bg-transparent py-4 text-base focus:ring-0"
                />

                <CommandList className="max-h-[60vh] p-2">
                    {/* Loading State - Exclusive */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                            <svg className="h-8 w-8 animate-spin mb-3 text-primary/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="animate-pulse">Searching tasks...</span>
                        </div>
                    ) : (
                        <>
                            {/* Empty State - Only matched if not loading and has search */}
                            {debouncedSearch && tasks?.length === 0 && (
                                <CommandEmpty>
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-3 rounded-full bg-muted/30 p-3 ring-1 ring-border/50">
                                            <Search className="h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No results found</p>
                                        <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                                            We couldn't find any tasks matching "{search}"
                                        </p>
                                    </div>
                                </CommandEmpty>
                            )}

                            {/* Actions - Only show when NOT searching */}
                            {!debouncedSearch && (
                                <>
                                    <CommandGroup heading="Actions" className="mb-2">
                                        <CommandItem onSelect={() => runCommand(() => router.push("/tasks/new"))} className="rounded-lg py-3 my-1 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary overflow-hidden transition-all">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-background mr-3 shadow-sm">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">Create New Task</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => runCommand(() => router.push("/tasks"))} className="rounded-lg py-3 my-1 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary overflow-hidden transition-all">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-background mr-3 shadow-sm">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">Go to Tasks</span>
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator className="my-2 bg-border/40" />
                                </>
                            )}

                            {/* Tasks Results */}
                            {tasks && tasks.length > 0 && (
                                <CommandGroup heading="Tasks" className="text-muted-foreground/70">
                                    {tasks.map((task) => (
                                        <CommandItem
                                            key={task.id}
                                            onSelect={() => runCommand(() => router.push(`/tasks/${task.id}`))}
                                            className="rounded-lg py-3 data-[selected=true]:bg-muted/60 my-1 scroll-m-2 transition-all"
                                        >
                                            {task.completed ? (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3 shadow-sm">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground/30 mr-3">
                                                    <Circle className="h-4 w-4" />
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                <span className={`truncate font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                    {task.title}
                                                </span>
                                                {task.tags && task.tags.length > 0 && (
                                                    <div className="flex gap-1.5 overflow-hidden">
                                                        {task.tags.map(tag => (
                                                            <span key={tag.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/50 text-muted-foreground">
                                                                <span className="mr-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `#${tag.color}` }} />
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
