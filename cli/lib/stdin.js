/**
 * Secure stdin reader — prompts for sensitive input without exposing it in process.argv.
 */

import { createInterface } from "node:readline";

export function readSecret(prompt) {
  return new Promise((resolve) => {
    process.stderr.write(prompt);
    const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: false });
    rl.once("line", (line) => {
      rl.close();
      resolve(line.trim());
    });
  });
}

/**
 * Run a policy check function from stdin JSON.
 * Used by standalone policy scripts (deny-transfers, deny-approvals, allowlist).
 */
export function runPolicyFromStdin(checkFn) {
  let input = "";
  process.stdin.on("data", (chunk) => (input += chunk));
  process.stdin.on("end", () => {
    try {
      const ctx = JSON.parse(input);
      console.log(JSON.stringify(checkFn(ctx)));
    } catch (e) {
      console.log(JSON.stringify({ allow: false, reason: `Policy error: ${e.message}` }));
    }
  });
}
