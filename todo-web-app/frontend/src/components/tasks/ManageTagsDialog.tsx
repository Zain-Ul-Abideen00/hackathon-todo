"use client";

import { useState } from "react";
import { TbTrash as Trash, TbPlus as Plus, TbEdit as Edit, TbCheck as Check, TbX as X } from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/lightswind/dialog";
import { Input } from "@/components/lightswind/input";
import { Label } from "@/components/lightswind/label";
import { useTagStore } from "@/stores/tagStore";
import { cn } from "@/lib/utils";

interface ManageTagsDialogProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ManageTagsDialog({ children, open, onOpenChange }: ManageTagsDialogProps) {
    const { tags, isLoading } = useTagStore();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                </DialogHeader>

                <TagManagerContent tags={tags || []} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}

function TagManagerContent({ tags, isLoading }: { tags: any[], isLoading: boolean }) {
    const { addTag, updateTag, deleteTag } = useTagStore();

    // Create State
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("3B82F6");

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const handleCreate = async () => {
        if (!newTagName.trim()) return;
        await addTag({ name: newTagName, color: newTagColor });
        setNewTagName("");
        setNewTagColor("3B82F6");
    };

    const startEditing = (tag: any) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName("");
        setEditColor("");
    };

    const saveEdit = async (id: number) => {
        if (!editName.trim()) return;
        await updateTag(id, { name: editName, color: editColor });
        setEditingId(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Delete this tag?")) {
            await deleteTag(id);
        }
    };

    return (
        <div className="space-y-4">
            {/* Create New */}
            <div className="flex gap-2 items-end p-2 border rounded-md bg-muted/20">
                <div className="grid gap-1 flex-1">
                    <Label className="text-xs">New Tag Name</Label>
                    <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="e.g. Work"
                        className="h-8"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                </div>
                <div className="grid gap-1">
                    <Label className="text-xs">Color</Label>
                    <div className="flex items-center gap-1 h-8 border rounded-md px-2 bg-background">
                        <input
                            type="color"
                            className="h-5 w-5 p-0 border-0 bg-transparent cursor-pointer"
                            value={"#" + newTagColor}
                            onChange={(e) => setNewTagColor(e.target.value.replace("#", ""))}
                        />
                    </div>
                </div>
                <Button size="sm" onClick={handleCreate} disabled={!newTagName.trim()}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading tags...</p>}
                {!isLoading && tags.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tags created yet.</p>
                )}
                {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/10 hover:bg-muted/30 transition-colors group">
                        {editingId === tag.id ? (
                            // Edit Mode
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <div className="flex items-center gap-1 h-8 border rounded-md px-2 bg-background">
                                    <input
                                        type="color"
                                        className="h-5 w-5 p-0 border-0 bg-transparent cursor-pointer"
                                        value={"#" + editColor}
                                        onChange={(e) => setEditColor(e.target.value.replace("#", ""))}
                                    />
                                </div>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8 flex-1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit(tag.id);
                                        if (e.key === 'Escape') cancelEditing();
                                    }}
                                />
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100" onClick={() => saveEdit(tag.id)}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={cancelEditing}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-3 w-3 rounded-full ring-1 ring-border"
                                        style={{ backgroundColor: `#${tag.color}` }}
                                    />
                                    <span className="text-sm font-medium">{tag.name}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => startEditing(tag)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(tag.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
