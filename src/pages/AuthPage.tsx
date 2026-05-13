import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const result = await signIn("password", formData);
      if (result && "redirect" in result && result.redirect) {
        return;
      }
      if (result && "signingIn" in result && result.signingIn) {
        navigate("/app", { replace: true });
        return;
      }
      setError(
        "Could not sign you in. If this is a new project, run `npm run convex:auth-env` once to configure JWT keys on your Convex deployment, then restart Convex dev.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const hint =
        /JWT_PRIVATE_KEY|JWKS|CONVEX_SITE_URL|Missing environment variable/i.test(message)
          ? " Run `npm run convex:auth-env` from the project root (with Convex dev / CLI configured), then restart `npx convex dev`."
          : "";
      setError((message || "Something went wrong.") + hint);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2.25rem 2rem",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p
            style={{
              margin: "0 0 0.35rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}
          >
            Welcome
          </p>
          <h1 style={{ margin: 0, fontSize: "1.85rem" }}>
            {mode === "signIn" ? "Sign in" : "Create your account"}
          </h1>
        </div>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              required
              minLength={8}
            />
          </div>
          <input name="flow" type="hidden" value={mode} />
          {error ? (
            <p style={{ margin: 0, color: "#7a2b2b", fontSize: "0.9rem" }}>{error}</p>
          ) : null}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>
            {mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p style={{ margin: "1.25rem 0 0", textAlign: "center", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          {mode === "signIn" ? "New to Linkwell? " : "Already have an account? "}
          <button
            type="button"
            className="btn-ghost"
            style={{
              border: "none",
              padding: 0,
              background: "none",
              color: "var(--accent)",
              textDecoration: "underline",
              cursor: "pointer",
              font: "inherit",
            }}
            onClick={() => {
              setMode(mode === "signIn" ? "signUp" : "signIn");
              setError(null);
            }}
          >
            {mode === "signIn" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
        <p style={{ margin: "1.25rem 0 0", textAlign: "center" }}>
          <Link to="/" style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
