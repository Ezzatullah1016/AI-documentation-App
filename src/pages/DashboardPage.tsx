import { useMutation, useQuery } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

function formatUpdatedAt(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const docs = useQuery(api.documents.listMine);
  const create = useMutation(api.documents.create);

  return (
    <div style={{ flex: 1, padding: "2rem 1.5rem", maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "2rem" }}>Your desk</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Open a piece you are shaping, or begin something new.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void create({}).then((id) => navigate(`/app/doc/${id}`));
            }}
          >
            New document
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>

      <div className="panel" style={{ padding: "0", overflow: "hidden" }}>
        {docs === undefined ? (
          <p style={{ padding: "1.5rem", color: "var(--text-muted)" }}>Loading documents…</p>
        ) : docs.length === 0 ? (
          <p style={{ padding: "1.5rem", color: "var(--text-muted)" }}>
            No documents yet. Start with <strong>New document</strong>.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {docs.map((d) => (
              <li key={d._id} style={{ borderTop: "1px solid var(--border)" }}>
                <Link
                  to={`/app/doc/${d._id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{d.title}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    Updated {formatUpdatedAt(d.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
