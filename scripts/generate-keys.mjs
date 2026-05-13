import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", {
  extractable: true,
});

const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

process.stdout.write(
  `JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, " ")}"\n`,
);
process.stdout.write(`JWKS=${jwks}\n`);
process.stdout.write(
  "\nFor Convex Auth, run from the project root (easiest):\n  npm run convex:auth-env\n",
);
process.stdout.write("Or paste both variables in Dashboard → Settings → Environment variables.\n");
process.stdout.write("Set OPENAI_API_KEY on the deployment for the writing assistant.\n");
