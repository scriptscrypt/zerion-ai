import * as ows from "../lib/ows.js";
import { print, printError } from "../lib/output.js";
import { setConfigValue, getConfigValue } from "../lib/config.js";

export default async function walletCreate(args, flags) {
  const name = flags.name || args[0] || generateName();

  try {
    const wallet = ows.createWallet(name, flags.passphrase);

    // Set as default wallet if none exists
    if (!getConfigValue("defaultWallet")) {
      setConfigValue("defaultWallet", name);
    }

    print({
      wallet: {
        name: wallet.name,
        evmAddress: wallet.evmAddress,
        solAddress: wallet.solAddress,
        chains: wallet.chains.length,
      },
      created: true,
      isDefault: getConfigValue("defaultWallet") === name,
    });
  } catch (err) {
    printError("ows_error", `Failed to create wallet: ${err.message}`);
    process.exit(1);
  }
}

function generateName() {
  try {
    const existing = ows.listWallets();
    return `wallet-${existing.length + 1}`;
  } catch {
    return "wallet-1";
  }
}
