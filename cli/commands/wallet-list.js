import * as ows from "../lib/ows.js";
import { print, printError } from "../lib/output.js";
import { getConfigValue } from "../lib/config.js";
import { formatWalletList } from "../lib/format.js";

export default async function walletList(_args, _flags) {
  try {
    const wallets = ows.listWallets();
    const defaultWallet = getConfigValue("defaultWallet");

    const data = {
      wallets: wallets.map((w) => ({
        name: w.name,
        evmAddress: w.evmAddress,
        solAddress: w.solAddress,
        isDefault: w.name === defaultWallet,
      })),
      count: wallets.length,
    };
    print(data, formatWalletList);
  } catch (err) {
    printError("ows_error", `Failed to list wallets: ${err.message}`);
    process.exit(1);
  }
}
