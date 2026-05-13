import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    contentHtml: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  knowledge: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),
});
