import * as ows from "../../lib/wallet/keystore.js";
import { print, printError } from "../../lib/util/output.js";
import { removeAgentTokensForWallet } from "../../lib/config.js";

export default async function agentRevokeToken(args, flags) {
  const nameOrId = flags.name || flags.id || args[0];

  if (!nameOrId) {
    printError("missing_args", "Token name or ID required", {
      example: "zerion agent revoke-token --name trading-bot",
    });
    process.exit(1);
  }

  try {
    // Find the wallet name before revoking so we can clean up config
    const tokens = ows.listAgentTokens();
    const wallets = ows.listWallets();
    const walletIdToName = new Map();
    for (const w of wallets) walletIdToName.set(w.id, w.name);

    const match = tokens.find((t) => t.name === nameOrId || t.id === nameOrId);
    const walletName = match ? walletIdToName.get(match.walletIds?.[0]) : null;

    ows.revokeAgentToken(nameOrId);

    // Clean up config
    if (walletName) removeAgentTokensForWallet(walletName);

    print({
      revoked: nameOrId,
      wallet: walletName,
      success: true,
    });
  } catch (err) {
    printError("ows_error", `Failed to revoke token: ${err.message}`);
    process.exit(1);
  }
}
