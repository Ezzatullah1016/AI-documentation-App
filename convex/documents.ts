import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return docs.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) {
      return null;
    }
    return doc;
  },
});

export const create = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    const title = args.title?.trim() || "Untitled document";
    return await ctx.db.insert("documents", {
      userId,
      title,
      contentHtml: "<p></p>",
      updatedAt: now,
    });
  },
});

export const updateContent = mutation({
  args: {
    documentId: v.id("documents"),
    contentHtml: v.string(),
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
    await ctx.db.patch(args.documentId, {
      contentHtml: args.contentHtml,
      updatedAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
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
    const title = args.title.trim() || "Untitled document";
    await ctx.db.patch(args.documentId, {
      title,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) {
      throw new Error("Document not found");
    }
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const k of knowledge) {
      await ctx.db.delete(k._id);
    }
    await ctx.db.delete(args.documentId);
  },
});
