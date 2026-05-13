import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) {
      return [];
    }
    const items = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    return items.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const add = mutation({
  args: {
    documentId: v.id("documents"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) {
      throw new Error("Document not found");
    }
    const body = args.body.trim();
    if (!body) {
      return;
    }
    const now = Date.now();
    await ctx.db.patch(args.documentId, { updatedAt: now });
    return await ctx.db.insert("knowledge", {
      userId,
      documentId: args.documentId,
      body,
      createdAt: now,
    });
  },
});

export const remove = mutation({
  args: { knowledgeId: v.id("knowledge") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const row = await ctx.db.get(args.knowledgeId);
    if (!row || row.userId !== userId) {
      throw new Error("Not found");
    }
    await ctx.db.delete(args.knowledgeId);
  },
});
