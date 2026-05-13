import { Link } from "react-router-dom";
import { useConvexAuth } from "convex/react";

export function LandingPage() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.25rem",
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: 560,
          width: "100%",
          padding: "2.75rem 2.5rem",
          textAlign: "center",
          boxShadow: "var(--shadow)",
        }}
      >
        <p
          style={{
            margin: "0 0 0.75rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          Linkwell
        </p>
        <h1 style={{ margin: "0 0 1rem", fontSize: "2.35rem", lineHeight: 1.15 }}>
          A quiet place for documents, context, and careful writing.
        </h1>
        <p style={{ margin: "0 0 2rem", color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Shape your drafts with rich text, keep reference notes alongside the page, and invite an
          assistant that respects the knowledge you provide.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {isAuthenticated ? (
            <Link to="/app" className="btn btn-primary">
              Open dashboard
            </Link>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              Sign in or create account
            </Link>
          )}
          <a href="#learn-more" className="btn btn-ghost">
            Learn more
          </a>
        </div>
      </div>
      <p
        id="learn-more"
        style={{
          marginTop: "2.5rem",
          maxWidth: 480,
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}
      >
        Built for writers who prefer typographic calm: soft edges, gentle depth, and serif rhythm
        from margin to margin.
      </p>
    </div>
  );
}
