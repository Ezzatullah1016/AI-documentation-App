import { useAction, useMutation, useQuery } from "convex/react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { RichTextEditor, type RichTextEditorHandle } from "../components/RichTextEditor.tsx";

type ChatMessage = { role: "user" | "assistant"; text: string };

function formatUpdatedAt(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DocumentEditorPage() {
  const { documentId } = useParams();
  const id = documentId as Id<"documents"> | undefined;
  const doc = useQuery(api.documents.get, id ? { documentId: id } : "skip");
  const knowledge = useQuery(api.knowledge.listForDocument, id ? { documentId: id } : "skip");
  const updateContent = useMutation(api.documents.updateContent);
  const rename = useMutation(api.documents.rename);
  const addKnowledge = useMutation(api.knowledge.add);
  const removeKnowledge = useMutation(api.knowledge.remove);
  const runAssistant = useAction(api.ai.assistant);

  const editorRef = useRef<RichTextEditorHandle | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [knowledgeDraft, setKnowledgeDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (doc) {
      setTitleDraft(doc.title);
    }
  }, [doc?.title]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatBusy]);

  const persistHtml = useCallback(
    async (html: string) => {
      if (!id) {
        return;
      }
      await updateContent({ documentId: id, contentHtml: html });
    },
    [id, updateContent],
  );

  async function flushTitle() {
    if (!id || !doc) {
      return;
    }
    const next = titleDraft.trim() || "Untitled document";
    if (next !== doc.title) {
      await rename({ documentId: id, title: next });
    }
  }

  async function onAddKnowledge(e: FormEvent) {
    e.preventDefault();
    if (!id) {
      return;
    }
    const body = knowledgeDraft.trim();
    if (!body) {
      return;
    }
    await addKnowledge({ documentId: id, body });
    setKnowledgeDraft("");
  }

  async function onSendChat(e: FormEvent) {
    e.preventDefault();
    if (!id) {
      return;
    }
    const text = chatInput.trim();
    if (!text || chatBusy) {
      return;
    }
    setChatInput("");
    setChatMessages((m) => [...m, { role: "user", text }]);
    setChatBusy(true);
    try {
      const res = await runAssistant({ documentId: id, message: text });
      setChatMessages((m) => [...m, { role: "assistant", text: res.reply }]);
      if (res.documentHtml) {
        editorRef.current?.applyHtml(res.documentHtml);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setChatMessages((m) => [...m, { role: "assistant", text: `Error: ${message}` }]);
    } finally {
      setChatBusy(false);
    }
  }

  if (!id) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Missing document.</p>
        <Link to="/app">Back to dashboard</Link>
      </div>
    );
  }

  if (doc === undefined) {
    return (
      <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Opening document…</div>
    );
  }

  if (doc === null) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>We could not find that document.</p>
        <Link to="/app">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header
        className="panel"
        style={{
          margin: "1rem 1rem 0",
          padding: "0.85rem 1.1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <Link to="/app" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          ← Dashboard
        </Link>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => void flushTitle()}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              fontSize: "1.25rem",
              fontFamily: "var(--font-serif)",
              fontWeight: 600,
            }}
          />
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Last updated {formatUpdatedAt(doc.updatedAt)}
          </p>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr) minmax(260px, 320px)",
          gap: "1rem",
          padding: "1rem",
          alignItems: "stretch",
        }}
        className="doc-layout"
      >
        <aside className="panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Knowledge</h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Plain notes the assistant reads when you ask it to write or edit this document.
          </p>
          <form onSubmit={onAddKnowledge} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <textarea
              value={knowledgeDraft}
              onChange={(e) => setKnowledgeDraft(e.target.value)}
              rows={5}
              placeholder="Paste facts, quotes, outline points…"
              style={{
                resize: "vertical",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                padding: "0.55rem 0.65rem",
                fontSize: "0.92rem",
                background: "#fffefb",
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
              Add to context
            </button>
          </form>
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {knowledge === undefined ? (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading…</p>
            ) : knowledge.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No knowledge yet. Add text above.
              </p>
            ) : (
              knowledge.map((k) => (
                <div
                  key={k._id}
                  style={{
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    padding: "0.55rem 0.65rem",
                    background: "#fffefb",
                  }}
                >
                  <p style={{ margin: "0 0 0.35rem", whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>{k.body}</p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "0.2rem 0.55rem", fontSize: "0.78rem" }}
                    onClick={() => void removeKnowledge({ knowledgeId: k._id })}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main style={{ minWidth: 0 }}>
          <RichTextEditor
            ref={editorRef}
            documentId={id}
            initialHtml={doc.contentHtml}
            onPersist={persistHtml}
          />
        </main>

        <aside className="panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Assistant</h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Ask for drafting help or revisions. When the model returns updated HTML, it is applied to
            your document.
          </p>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              padding: "0.65rem",
              background: "#fffefb",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              minHeight: 220,
            }}
          >
            {chatMessages.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Try: “Expand the second section with a warmer tone, using the knowledge notes.”
              </p>
            ) : null}
            {chatMessages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  borderRadius: 12,
                  padding: "0.45rem 0.65rem",
                  fontSize: "0.9rem",
                  background: m.role === "user" ? "var(--accent-soft)" : "var(--surface-muted)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {m.role === "user" ? "You" : "Assistant"}
                </span>
                <p style={{ margin: "0.2rem 0 0", whiteSpace: "pre-wrap" }}>{m.text}</p>
              </div>
            ))}
            {chatBusy ? (
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>Thinking…</p>
            ) : null}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={onSendChat} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              rows={3}
              placeholder="Ask the assistant to write or revise…"
              style={{
                resize: "vertical",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                padding: "0.55rem 0.65rem",
                fontSize: "0.92rem",
                background: "#fffefb",
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={chatBusy} style={{ alignSelf: "flex-start" }}>
              Send
            </button>
          </form>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .doc-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
