import * as ows from "../../lib/wallet/keystore.js";
import { print, printError } from "../../lib/util/output.js";
import { getConfigValue } from "../../lib/config.js";

export default async function agentListTokens(_args, _flags) {
  try {
    const tokens = ows.listAgentTokens();
    const wallets = ows.listWallets();
    const defaultWallet = getConfigValue("defaultWallet");

    const walletIdToName = new Map();
    for (const w of wallets) walletIdToName.set(w.id, w.name);

    print({
      tokens: tokens.map((t) => {
        const walletName = (t.walletIds || []).map((id) => walletIdToName.get(id) || id)[0] || "unknown";
        return {
          name: t.name,
          wallet: walletName,
          active: walletName === defaultWallet,
          expiresAt: t.expiresAt,
          createdAt: t.createdAt,
        };
      }),
      count: tokens.length,
    });
  } catch (err) {
    printError("ows_error", `Failed to list agent tokens: ${err.message}`);
    process.exit(1);
  }
}
