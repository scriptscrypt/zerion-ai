import { getSwapQuote, executeSwap } from "../lib/swap.js";
import { getAgentToken } from "../lib/ows.js";
import { resolveWallet } from "../lib/resolve-wallet.js";
import { print, printError } from "../lib/output.js";
import { getConfigValue } from "../lib/config.js";

export default async function sell(args, flags) {
  const [token, amount] = args;

  if (!token) {
    printError("missing_args", "Usage: zerion sell <token> [amount]", {
      example: "zerion sell PEPE 1000000 --chain base",
    });
    process.exit(1);
  }

  if (!amount) {
    printError("missing_amount", "Specify an amount to sell", {
      example: `zerion sell ${token} 1000000`,
    });
    process.exit(1);
  }

  const { walletName, address } = resolveWallet(flags);
  const chain = flags.chain || getConfigValue("defaultChain") || "ethereum";

  try {
    // Sell = swap from token to ETH
    const quote = await getSwapQuote({
      fromToken: token,
      toToken: "ETH",
      amount,
      fromChain: chain,
      walletAddress: address,
      slippage: flags.slippage ? parseFloat(flags.slippage) : undefined,
    });

    if (quote.preconditions.enough_balance === false) {
      printError("insufficient_funds", `Insufficient ${quote.from.symbol} balance`, {
        suggestion: `Check balance: zerion portfolio --wallet ${walletName}`,
      });
      process.exit(1);
    }

    const quoteSummary = {
      sell: {
        selling: `${amount} ${quote.from.symbol}`,
        receiving: `~${quote.estimatedOutput} ETH`,
        fee: quote.fee,
        source: quote.liquiditySource,
        chain,
      },
    };

    if (!flags.yes) {
      print({
        ...quoteSummary,
        action: "Confirm with --yes to execute",
        command: `zerion sell ${token} ${amount} --chain ${chain} --wallet ${walletName} --yes`,
      });
      return;
    }

    const passphrase = getAgentToken() || flags.passphrase;
    const result = await executeSwap(quote, walletName, passphrase);

    print({
      ...quoteSummary,
      tx: {
        hash: result.hash,
        status: result.status,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
      },
      executed: true,
    });
  } catch (err) {
    printError(err.code || "sell_error", err.message, {
      suggestion: err.suggestion,
    });
    process.exit(1);
  }
}
