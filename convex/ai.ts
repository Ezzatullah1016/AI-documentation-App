import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const internalGetDocContext = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      return null;
    }
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    const knowledgeText = knowledge
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((k) => k.body)
      .join("\n\n---\n\n");
    return {
      title: doc.title,
      contentHtml: doc.contentHtml,
      knowledgeText,
      userId: doc.userId,
    };
  },
});

export const assistant = action({
  args: {
    documentId: v.id("documents"),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ reply: string; documentHtml?: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const snapshot = await ctx.runQuery(internal.ai.internalGetDocContext, {
      documentId: args.documentId,
    });
    if (!snapshot || snapshot.userId !== userId) {
      throw new Error("Document not found");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in Convex environment variables");
    }

    const system = `You are a writing assistant embedded in a document editor.

The user works in HTML (TipTap / ProseMirror subset). When you change the document, you MUST return valid HTML fragments suitable inside a contenteditable rich text area: use tags like <p>, <h2>, <h3>, <strong>, <em>, <ul>, <li>, <blockquote>.

Knowledge entries (reference only, may be empty):
${snapshot.knowledgeText || "(none)"}

Current document title: ${snapshot.title}

Current document HTML:
${snapshot.contentHtml}

When the user asks you to write into the document, revise it, or edit specific parts, include a JSON object at the VERY END of your reply in this exact format on its own line:
LINKWELL_DOC_JSON:{"documentHtml":"<full replacement html for the document body>"}

If you are only answering conversationally and should NOT change the document, omit LINKWELL_DOC_JSON entirely.

The documentHtml must be a full HTML document body content (not a full HTML shell). Use consistent semantic HTML.

Before LINKWELL_DOC_JSON you may write a short conversational message to the user explaining what you changed.`;

    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system" as const, content: system },
        { role: "user" as const, content: args.message.trim() },
      ],
      temperature: 0.5,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";

    const marker = "LINKWELL_DOC_JSON:";
    const idx = content.lastIndexOf(marker);
    if (idx === -1) {
      return { reply: content.trim() };
    }

    const replyPart = content.slice(0, idx).trim();
    const jsonPart = content.slice(idx + marker.length).trim();

    try {
      const parsed = JSON.parse(jsonPart) as { documentHtml?: string };
      const documentHtml = parsed.documentHtml?.trim();
      if (documentHtml) {
        return { reply: replyPart || "Updated the document.", documentHtml };
      }
    } catch {
      return {
        reply: `${replyPart}\n\n(I tried to apply an edit but the model response was not valid JSON.)`,
      };
    }

    return { reply: replyPart || content.trim() };
  },
});
