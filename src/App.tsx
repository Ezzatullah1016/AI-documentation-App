import { Navigate, Route, Routes } from "react-router-dom";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LandingPage } from "./pages/LandingPage.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { DocumentEditorPage } from "./pages/DocumentEditorPage.tsx";

export default function App() {
  return (
    <div className="app-shell">
      <AuthLoading>
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Preparing your workspace…
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Unauthenticated>
      <Authenticated>
        <Routes>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/doc/:documentId" element={<DocumentEditorPage />} />
          <Route path="/auth" element={<Navigate to="/app" replace />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Authenticated>
    </div>
  );
}
