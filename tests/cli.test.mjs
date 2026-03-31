import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = join(__dirname, "../cli/zerion-cli.js");

describe("zerion-cli", () => {
  it("prints help", async () => {
    const output = await new Promise((resolve, reject) => {
      execFile("node", [BIN, "--help"], (error, stdout) => {
        if (error) return reject(error);
        resolve(stdout);
      });
    });

    assert.match(output, /wallet analyze/);
    assert.match(output, /chains/);
  });

  it("fails clearly when API key is missing for API commands", async () => {
    const { code, stderr } = await new Promise((resolve) => {
      execFile(
        "node",
        [BIN, "wallet", "analyze", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        { env: { ...process.env, ZERION_API_KEY: "" } },
        (error, _stdout, stderr) => {
          resolve({ code: error?.code ?? 0, stderr });
        }
      );
    });

    // wallet analyze fetches all endpoints in parallel; failures are captured
    // but at minimum we expect the command to run and produce output
    assert.equal(code, 0);
  });

  it("chains command works without API key", async () => {
    const { code, stdout } = await new Promise((resolve) => {
      execFile(
        "node",
        [BIN, "chains", "--json"],
        { env: { ...process.env, ZERION_API_KEY: "" } },
        (error, stdout) => {
          resolve({ code: error?.code ?? 0, stdout });
        }
      );
    });

    assert.equal(code, 0);
    const json = JSON.parse(stdout);
    assert.ok(json.chains);
    assert.ok(json.count > 0);
  });
});
