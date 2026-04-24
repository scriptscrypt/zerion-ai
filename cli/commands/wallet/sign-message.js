import * as ows from "../../lib/wallet/keystore.js";
import { print, printError } from "../../lib/util/output.js";
import { getConfigValue } from "../../lib/config.js";
import { readPassphrase } from "../../lib/util/prompt.js";
import { toCaip2, SUPPORTED_CHAINS } from "../../lib/chain/registry.js";

export default async function walletSignMessage(args, flags) {
  const walletName = flags.wallet || getConfigValue("defaultWallet");
  const chain = flags.chain || getConfigValue("defaultChain") || "ethereum";
  const encoding = flags.encoding || "utf8";
  const message = flags.message ?? args[0];

  if (!walletName) {
    printError("no_wallet", "No wallet specified", {
      suggestion: "Use --wallet <name> or set default: zerion config set defaultWallet <name>",
    });
    process.exit(1);
  }

  if (message == null || message === "") {
    printError("no_message", "No message provided", {
      suggestion: "Pass the message as the first argument or --message <text>",
    });
    process.exit(1);
  }

  if (encoding !== "utf8" && encoding !== "hex") {
    printError("invalid_encoding", `Invalid --encoding "${encoding}"`, {
      suggestion: 'Use "utf8" or "hex"',
    });
    process.exit(1);
  }

  if (!SUPPORTED_CHAINS.includes(chain)) {
    printError("invalid_chain", `Unsupported chain "${chain}"`, {
      suggestion: `Supported: ${SUPPORTED_CHAINS.join(", ")}`,
    });
    process.exit(1);
  }

  // Signing arbitrary messages can authorize off-chain actions (SIWE, permit2).
  // Warn interactive users; agent callers know what they're doing.
  const agentToken = ows.getAgentToken();
  if (!agentToken && process.stderr.isTTY) {
    process.stderr.write(
      "\n⚠️  Signing arbitrary messages can authorize off-chain actions (SIWE, permit2).\n" +
      "   Only sign messages from sources you trust.\n\n"
    );
  }

  try {
    const wallet = ows.getWallet(walletName);
    const passphrase = agentToken || await readPassphrase();
    const caip2 = toCaip2(chain);
    const result = ows.signMessage(walletName, message, passphrase, encoding, caip2);

    const isSolana = chain === "solana";
    print({
      wallet: wallet.name,
      address: isSolana ? wallet.solAddress : wallet.evmAddress,
      chain,
      encoding,
      message,
      signature: result.signature,
      ...(result.recoveryId != null ? { recoveryId: result.recoveryId } : {}),
    });
  } catch (err) {
    const code = err.message?.includes("passphrase") || err.message?.includes("decrypt")
      ? "wrong_passphrase" : "sign_error";
    printError(code, `Failed to sign message: ${err.message}`);
    process.exit(1);
  }
}
