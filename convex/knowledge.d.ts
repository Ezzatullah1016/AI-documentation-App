export declare const listForDocument: import("convex/server").RegisteredQuery<"public", {
    documentId: import("convex/values").GenericId<"documents">;
}, Promise<{
    _id: import("convex/values").GenericId<"knowledge">;
    _creationTime: number;
    userId: import("convex/values").GenericId<"users">;
    documentId: import("convex/values").GenericId<"documents">;
    body: string;
    createdAt: number;
}[]>>;
export declare const add: import("convex/server").RegisteredMutation<"public", {
    documentId: import("convex/values").GenericId<"documents">;
    body: string;
}, Promise<import("convex/values").GenericId<"knowledge"> | undefined>>;
export declare const remove: import("convex/server").RegisteredMutation<"public", {
    knowledgeId: import("convex/values").GenericId<"knowledge">;
}, Promise<void>>;
//# sourceMappingURL=knowledge.d.ts.map