"use client";

import { useEffect, useState } from "react";
import { TbCheck as Check, TbSettings as Settings, TbTag as TagIcon, TbPlus as Plus } from "react-icons/tb";

import { Button } from "@/components/lightswind/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/lightswind/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/lightswind/popover";
import { useTagStore } from "@/stores/tagStore";
import { cn } from "@/lib/utils";
import { ManageTagsDialog } from "./ManageTagsDialog";

interface TagSelectorProps {
    value: number[];
    onChange: (value: number[]) => void;
    variant?: "ghost" | "outline" | "default" | "secondary";
    className?: string;
}

export function TagSelector({ value = [], onChange, variant = "ghost", className }: TagSelectorProps) {
    // Use store instead of direct query
    const { tags, fetchTags, addTag, isLoading } = useTagStore();
    const [open, setOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Fetch tags on mount
    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const selectedTags = tags.filter((t) => value.includes(t.id));

    const toggleTag = (id: number) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const handleCreateTag = async () => {
        if (!searchValue.trim()) return;
        await addTag({ name: searchValue.trim() });
        setSearchValue("");
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant={variant}
                        size="sm"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "h-9 gap-2 px-3 text-muted-foreground hover:text-foreground justify-start font-normal",
                            variant === "outline" && "border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
                            variant === "ghost" && "px-2",
                            className
                        )}
                    >
                        <TagIcon className="h-4 w-4" />
                        {selectedTags.length > 0 ? (
                            <span className="text-sm font-medium text-foreground">
                                {selectedTags.length} selected
                            </span>
                        ) : (
                            <span className="text-sm">Tags</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search tags..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                <div className="flex flex-col items-center gap-2 p-2">
                                    <span className="text-sm text-muted-foreground">No tags found.</span>
                                    {searchValue && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start mt-2"
                                            onClick={handleCreateTag}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create "{searchValue}"
                                        </Button>
                                    )}
                                </div>
                            </CommandEmpty>
                            <CommandGroup heading="Tags">
                                {tags
                                    .filter(tag => tag.name.toLowerCase().includes(searchValue.toLowerCase()))
                                    .map((tag) => (
                                        <CommandItem
                                            key={tag.id}
                                            value={tag.name}
                                            onSelect={() => toggleTag(tag.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: `#${tag.color}` }}
                                                />
                                                <span>{tag.name}</span>
                                            </div>
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    value.includes(tag.id)
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                            <CommandGroup className="pt-0 border-t">
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        setManageOpen(true);
                                    }}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Manage Tags
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <ManageTagsDialog open={manageOpen} onOpenChange={setManageOpen} />
        </>
    );
}
