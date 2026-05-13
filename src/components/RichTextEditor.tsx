import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type RichTextEditorHandle = {
  applyHtml: (html: string) => void;
};

interface RichTextEditorProps {
  documentId: string;
  initialHtml: string;
  onPersist: (html: string) => void;
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) {
    return null;
  }
  const btn = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      className={active ? "is-active" : ""}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
  return (
    <div className="toolbar">
      {btn("Bold", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
      {btn("Italic", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run())}
      {btn(
        "Heading 2",
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      )}
      {btn(
        "Heading 3",
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      )}
      {btn("Bullets", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
      {btn(
        "Quote",
        editor.isActive("blockquote"),
        () => editor.chain().focus().toggleBlockquote().run(),
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        Undo
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        Redo
      </button>
    </div>
  );
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditorInner({ documentId, initialHtml, onPersist }, ref) {
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hydratedFor = useRef<string | null>(null);

    const editor = useEditor({
      extensions: [StarterKit],
      content: "<p></p>",
      editorProps: {
        attributes: {
          class: "tiptap-editor",
        },
      },
    });

    useEffect(() => {
      if (!editor) {
        return;
      }
      if (hydratedFor.current !== documentId) {
        editor.commands.setContent(initialHtml && initialHtml.trim() ? initialHtml : "<p></p>");
        hydratedFor.current = documentId;
      }
    }, [editor, documentId, initialHtml]);

    const persistSoon = useCallback(
      (html: string) => {
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
        }
        saveTimer.current = setTimeout(() => {
          onPersist(html);
        }, 650);
      },
      [onPersist],
    );

    useEffect(() => {
      if (!editor) {
        return;
      }
      const handler = () => {
        persistSoon(editor.getHTML());
      };
      editor.on("update", handler);
      return () => {
        editor.off("update", handler);
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
        }
      };
    }, [editor, persistSoon]);

    useImperativeHandle(
      ref,
      () => ({
        applyHtml: (html: string) => {
          if (!editor) {
            return;
          }
          editor.commands.setContent(html);
          persistSoon(html);
        },
      }),
      [editor, persistSoon],
    );

    return (
      <div className="panel" style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    );
  },
);
RichTextEditor.displayName = "RichTextEditor";
