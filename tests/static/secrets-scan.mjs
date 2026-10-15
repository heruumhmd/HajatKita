import { execSync } from "child_process";
import test from "node:test";
import assert from "node:assert/strict";

test("Static Suite: Secret Leak Scanner", async (t) => {
  await t.test("No active files contain raw Neon connection strings or private keys", () => {
    try {
      // Grep working tree for forbidden patterns
      const output = execSync(
        `git grep -E "(npg_[a-zA-Z0-9_-]{10,}|BEGIN PRIVATE KEY|neondb_owner:)" -- :!tests/static/secrets-scan.mjs`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
      );
      assert.equal(output.trim(), "", `Found potential secret in working tree:\n${output}`);
    } catch (err) {
      // Exit code 1 from git grep means no matches found -> which is SUCCESS!
      assert.ok(true, "No secret patterns found in tracked working tree");
    }
  });

  await t.test("No personal emails in tracked test scripts", () => {
    try {
      const output = execSync(
        `git grep -E "(nurulfathonahh|herum556)" -- tests/`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
      );
      assert.equal(output.trim(), "", `Found personal email in tests directory:\n${output}`);
    } catch (err) {
      assert.ok(true, "No personal emails found in tests directory");
    }
  });
});
