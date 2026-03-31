import { getSwapQuote, executeSwap } from "../lib/swap.js";
import { getAgentToken } from "../lib/ows.js";
import { resolveWallet } from "../lib/resolve-wallet.js";
import { print, printError } from "../lib/output.js";
import { getConfigValue } from "../lib/config.js";

export default async function buy(args, flags) {
  const [token, amount] = args;

  if (!token) {
    printError("missing_args", "Usage: zerion buy <token> [amount]", {
      example: "zerion buy PEPE 0.01ETH --chain base",
    });
    process.exit(1);
  }

  if (!amount) {
    printError("missing_amount", "Specify an amount (in ETH)", {
      example: `zerion buy ${token} 0.01`,
    });
    process.exit(1);
  }

  const { walletName, address } = resolveWallet(flags);
  const chain = flags.chain || getConfigValue("defaultChain") || "ethereum";

  try {
    // Buy = swap from ETH to target token
    const quote = await getSwapQuote({
      fromToken: "ETH",
      toToken: token,
      amount,
      fromChain: chain,
      walletAddress: address,
      slippage: flags.slippage ? parseFloat(flags.slippage) : undefined,
    });

    if (quote.preconditions.enough_balance === false) {
      printError("insufficient_funds", "Insufficient ETH balance", {
        suggestion: `Fund your wallet: zerion wallet fund --wallet ${walletName}`,
      });
      process.exit(1);
    }

    const quoteSummary = {
      buy: {
        spending: `${amount} ETH`,
        receiving: `~${quote.estimatedOutput} ${quote.to.symbol}`,
        fee: quote.fee,
        source: quote.liquiditySource,
        chain,
      },
    };

    if (!flags.yes) {
      print({
        ...quoteSummary,
        action: "Confirm with --yes to execute",
        command: `zerion buy ${token} ${amount} --chain ${chain} --wallet ${walletName} --yes`,
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
    printError(err.code || "buy_error", err.message, {
      suggestion: err.suggestion,
    });
    process.exit(1);
  }
}
