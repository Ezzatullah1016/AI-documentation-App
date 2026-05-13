/**
 * Generates an RS256 keypair and sets Convex Auth env vars via `convex env set --from-file`.
 * Run: npm run convex:auth-env
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadSiteUrl() {
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*VITE_CONVEX_SITE_URL=(.+)\s*$/);
      if (m) {
        return m[1].replace(/^["']|["']$/g, "").trim();
      }
    }
  }
  return "http://127.0.0.1:3211";
}

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
const pkOneLine = privateKey.trimEnd().replace(/\n/g, " ");
const siteUrl = loadSiteUrl();

const dir = mkdtempSync(join(tmpdir(), "convex-auth-"));
const envFile = join(dir, "auth.env");
const dotenvBody =
  `JWT_PRIVATE_KEY=${JSON.stringify(pkOneLine)}\n` +
  `JWKS=${JSON.stringify(jwks)}\n` +
  `CONVEX_SITE_URL=${JSON.stringify(siteUrl)}\n`;
writeFileSync(envFile, dotenvBody, "utf8");

console.info("Setting Convex Auth environment variables (JWT_PRIVATE_KEY, JWKS, CONVEX_SITE_URL)...");
const r = spawnSync("npx", ["convex", "env", "set", "--from-file", envFile, "--force"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

rmSync(dir, { recursive: true, force: true });

if (r.error) {
  console.error(r.error);
  process.exit(1);
}
if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

console.info("Done. Restart `npx convex dev` if it is already running, then try Sign up again.");
