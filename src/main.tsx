import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const url = import.meta.env.VITE_CONVEX_URL;
if (!url) {
  throw new Error("Missing VITE_CONVEX_URL. Add it to .env.local — run `npx convex dev` for the URL.");
}

const convex = new ConvexReactClient(url);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
);
