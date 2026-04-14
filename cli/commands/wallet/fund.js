import * as ows from "../../lib/wallet/keystore.js";
import { print, printError } from "../../lib/util/output.js";
import { getConfigValue, getWalletOrigin } from "../../lib/config.js";

export default async function walletFund(args, flags) {
  const walletName = flags.wallet || args[0] || getConfigValue("defaultWallet");

  if (!walletName) {
    printError("no_wallet", "No wallet specified", {
      suggestion: "Use --wallet <name> or set default: zerion config set defaultWallet <name>",
    });
    process.exit(1);
  }

  try {
    const origin = getWalletOrigin(walletName);
    const wallet = { name: walletName };
    const instructions = {};

    if (origin !== "sol-key") {
      wallet.evmAddress = ows.getEvmAddress(walletName);
      instructions.evm = "Send EVM tokens (ETH, USDC, etc.) to the EVM address above.";
    }
    if (origin !== "evm-key") {
      wallet.solAddress = ows.getSolAddress(walletName);
      instructions.solana = "Send SOL or SPL tokens to the Solana address above.";
    }

    print({ wallet, instructions });
  } catch (err) {
    printError("wallet_not_found", `Wallet "${walletName}" not found`, {
      suggestion: "List wallets with: zerion wallet list",
    });
    process.exit(1);
  }
}
