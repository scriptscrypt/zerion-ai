import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ZERION_BIN = fileURLToPath(
  new URL("../../../../zerion.js", import.meta.url)
);

function runZerion(args, opts = {}) {
  return spawnSync("node", [ZERION_BIN, ...args], {
    encoding: "utf8",
    env: process.env,
    ...opts,
  });
}

describe("zerion sendai-ideas", () => {
  it("bare command prints command-specific help (not global usage)", () => {
    const res = runZerion(["sendai-ideas"]);
    assert.equal(res.status, 0);
    const out = JSON.parse(res.stdout);
    assert.match(out.usage, /sendai-ideas/);
    assert.ok(out.modes["--info"]);
    assert.ok(out.modes["--protocols"]);
    assert.ok(out.modes["--yields"]);
    assert.ok(out.source.upstream.includes("sendaifun/solana-new"));
  });

  it("--info flag returns skill metadata for agent discovery", () => {
    const res = runZerion(["sendai-ideas", "--info"]);
    assert.equal(res.status, 0);
    const out = JSON.parse(res.stdout);
    assert.equal(out.ok, true);
    assert.equal(out.skill, "zerion-sendai-ideas");
    assert.deepEqual(out.modes, [
      "discover",
      "validate",
      "landscape",
      "defi-research",
    ]);
    assert.ok(out.cli_primitives.includes("zerion sendai-ideas --protocols"));
    assert.ok(out.cli_primitives.includes("zerion sendai-ideas --yields"));
  });

  it("unknown flags fall through to help (no error)", () => {
    const res = runZerion(["sendai-ideas", "--bogus"]);
    assert.equal(res.status, 0);
    const out = JSON.parse(res.stdout);
    assert.match(out.usage, /sendai-ideas/);
  });
});
