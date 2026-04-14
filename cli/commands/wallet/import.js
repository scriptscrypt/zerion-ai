import { readFileSync, lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import * as ows from "../../lib/wallet/keystore.js";
import { print, printError } from "../../lib/util/output.js";
import { setConfigValue, getConfigValue, setWalletOrigin } from "../../lib/config.js";
import { readSecret, readPassphrase } from "../../lib/util/prompt.js";
import { offerAgentToken } from "../../lib/wallet/offer-agent-token.js";

async function resolveSecretInput(flags, flagName, prompt) {
  if (typeof flags[flagName] === "string" && flags[flagName].length > 0) {
    return flags[flagName];
  }
  if (flags[flagName] === true || flags[flagName] === "") {
    return readSecret(prompt);
  }
  return null;
}

export default async function walletImport(args, flags) {
  const name = flags.name || args[0] || `imported-${Date.now()}`;

  const hasEvmKey = !!flags["evm-key"];
  const hasSolKey = !!flags["sol-key"];
  const hasMnemonic = flags.mnemonic || flags["mnemonic-file"];
  const inputCount = [hasEvmKey, hasSolKey, hasMnemonic].filter(Boolean).length;

  if (inputCount === 0) {
    printError(
      "missing_input",
      "Provide --evm-key, --sol-key, or --mnemonic",
      { suggestion: "zerion wallet import --evm-key          # EVM private key (interactive)\nzerion wallet import --sol-key      # Solana private key (interactive)\nzerion wallet import --mnemonic     # Seed phrase (interactive)" }
    );
    process.exit(1);
  }

  if (inputCount > 1) {
    printError("invalid_input", "Provide only one of --evm-key, --sol-key, or --mnemonic");
    process.exit(1);
  }

  try {
    process.stderr.write("A passphrase is required to encrypt your wallet.\n\n");
    const passphrase = await readPassphrase({ confirm: true });

    process.stderr.write(
      "\n" +
      "WARNING: This passphrase is the ONLY way to recover your wallet or\n" +
      "create new agent tokens. There is no reset or recovery mechanism.\n" +
      "If you lose it, your funds are permanently inaccessible.\n\n"
    );

    let wallet;
    let origin;

    if (hasEvmKey) {
      const key = await resolveSecretInput(flags, "evm-key", "Enter EVM private key (hex): ");
      wallet = ows.importFromKey(name, key, passphrase, "evm");
      origin = "evm-key";
    } else if (hasSolKey) {
      const key = await resolveSecretInput(flags, "sol-key", "Enter Solana private key (base58, hex, or byte array): ");
      wallet = ows.importFromKey(name, key, passphrase, "solana");
      origin = "sol-key";
    } else {
      const mnemonic = await resolveSecretInput(flags, "mnemonic", "Enter mnemonic phrase: ");
      wallet = ows.importFromMnemonic(name, mnemonic, passphrase);
      origin = "mnemonic";
    }

    setWalletOrigin(name, origin);

    if (!getConfigValue("defaultWallet")) {
      setConfigValue("defaultWallet", name);
    }

    // Only show addresses relevant to the import type
    const walletInfo = { name: wallet.name };
    if (origin !== "sol-key") walletInfo.evmAddress = wallet.evmAddress;
    if (origin !== "evm-key") walletInfo.solAddress = wallet.solAddress;

    print({ wallet: walletInfo, imported: true });

    // Offer agent token creation as part of wallet setup
    await offerAgentToken(name, passphrase);
  } catch (err) {
    printError("ows_error", `Failed to import wallet: ${err.message}`);
    process.exit(1);
  }
}
