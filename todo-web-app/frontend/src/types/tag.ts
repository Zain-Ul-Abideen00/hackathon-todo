export interface Tag {
    id: number;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface TagCreate {
    name: string;
    color?: string;
}

export interface TagUpdate {
    name?: string;
    color?: string;
}
