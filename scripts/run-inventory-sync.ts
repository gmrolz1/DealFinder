// Run the inventory refresh from the CLI (same engine as /inventory/update).
//   node --env-file=.env.local node_modules/jiti/lib/jiti-cli.mjs scripts/run-inventory-sync.ts [nawy] [propertyhub] [publish]
// Optional: PH_COOKIE_FILE / NAWY_TOKEN_FILE = path to a file holding a fresh credential to store first.
import { readFileSync } from "node:fs";
import { setCredential, syncNawy, syncPropertyHub } from "../src/lib/inventory-sync";
import { getSupabaseAdmin } from "../src/lib/supabase-admin";

async function main() {
  if (process.env.PH_COOKIE_FILE) {
    await setCredential("propertyhub", "cookie", readFileSync(process.env.PH_COOKIE_FILE, "utf8").trim());
    console.log("stored propertyhub cookie");
  }
  if (process.env.NAWY_TOKEN_FILE) {
    await setCredential("nawy", "bearer", readFileSync(process.env.NAWY_TOKEN_FILE, "utf8").trim());
    console.log("stored nawy token");
  }
  const steps = process.argv.slice(2);
  for (const step of steps.length ? steps : ["nawy", "propertyhub", "publish"]) {
    const t = Date.now();
    if (step === "nawy") console.log("nawy", await syncNawy());
    else if (step === "propertyhub") console.log("propertyhub", await syncPropertyHub());
    else if (step === "publish") {
      const { data, error } = await getSupabaseAdmin().rpc("promote_to_site");
      console.log("publish", error ? { error: error.message } : data);
    }
    console.log(`${step} took ${((Date.now() - t) / 1000).toFixed(1)}s`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
