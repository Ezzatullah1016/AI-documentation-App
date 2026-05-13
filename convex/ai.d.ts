export declare const internalGetDocContext: import("convex/server").RegisteredQuery<"internal", {
    documentId: import("convex/values").GenericId<"documents">;
}, Promise<{
    title: string;
    contentHtml: string;
    knowledgeText: string;
    userId: import("convex/values").GenericId<"users">;
} | null>>;
export declare const assistant: import("convex/server").RegisteredAction<"public", {
    documentId: import("convex/values").GenericId<"documents">;
    message: string;
}, Promise<{
    reply: string;
    documentHtml?: string;
}>>;
//# sourceMappingURL=ai.d.ts.map