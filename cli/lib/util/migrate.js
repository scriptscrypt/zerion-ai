/**
 * One-time migration from zerion-cli → zerion.
 * Moves ~/.zerion-cli to ~/.zerion and prints a notice on stderr
 * (stderr so JSON stdout stays clean for agent consumers).
 */

import { existsSync, renameSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const HOME = process.env.HOME || process.env.USERPROFILE;
const OLD_DIR = join(HOME, ".zerion-cli");
const NEW_DIR = join(HOME, ".zerion");

export function migrateFromZerionCli() {
  if (!existsSync(OLD_DIR)) return;

  if (!existsSync(NEW_DIR)) {
    try {
      renameSync(OLD_DIR, NEW_DIR);
      process.stderr.write(
        "\n" +
        "╔══════════════════════════════════════════════════════════════╗\n" +
        "║  zerion-cli has been renamed to zerion                      ║\n" +
        "║                                                             ║\n" +
        "║  • Command is now: zerion (not zerion-cli)                  ║\n" +
        "║  • Config migrated: ~/.zerion-cli → ~/.zerion               ║\n" +
        "║  • You can uninstall the old package:                       ║\n" +
        "║      npm uninstall -g zerion-cli                            ║\n" +
        "╚══════════════════════════════════════════════════════════════╝\n" +
        "\n"
      );
    } catch {
      // If rename fails (e.g. cross-device), warn but don't crash
      process.stderr.write(
        "[zerion] Warning: could not migrate ~/.zerion-cli → ~/.zerion. " +
        "Please move it manually.\n"
      );
    }
  } else {
    // Both dirs exist — just notify to clean up
    process.stderr.write(
      "[zerion] Note: zerion-cli has been renamed to zerion. " +
      "You can remove the old ~/.zerion-cli directory.\n"
    );
  }
}
