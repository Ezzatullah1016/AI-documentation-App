export declare const listMine: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"documents">;
    _creationTime: number;
    userId: import("convex/values").GenericId<"users">;
    title: string;
    contentHtml: string;
    updatedAt: number;
}[]>>;
export declare const get: import("convex/server").RegisteredQuery<"public", {
    documentId: import("convex/values").GenericId<"documents">;
}, Promise<{
    _id: import("convex/values").GenericId<"documents">;
    _creationTime: number;
    userId: import("convex/values").GenericId<"users">;
    title: string;
    contentHtml: string;
    updatedAt: number;
} | null>>;
export declare const create: import("convex/server").RegisteredMutation<"public", {
    title?: string;
}, Promise<import("convex/values").GenericId<"documents">>>;
export declare const updateContent: import("convex/server").RegisteredMutation<"public", {
    contentHtml: string;
    documentId: import("convex/values").GenericId<"documents">;
}, Promise<void>>;
export declare const rename: import("convex/server").RegisteredMutation<"public", {
    title: string;
    documentId: import("convex/values").GenericId<"documents">;
}, Promise<void>>;
export declare const remove: import("convex/server").RegisteredMutation<"public", {
    documentId: import("convex/values").GenericId<"documents">;
}, Promise<void>>;
//# sourceMappingURL=documents.d.ts.map