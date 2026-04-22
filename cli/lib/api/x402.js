// x402 pay-per-call support — lazy-loaded.
// Only imports @x402/fetch and @x402/evm when actually needed.

let _x402Fetch = null;

function normalizeX402Error(err) {
  const msg = err.message || "";
  if (/insufficient.*balance|not enough.*funds|balance.*too low/i.test(msg)) {
    const e = new Error(
      "Insufficient USDC on Base for x402 payment.\n" +
      "Fund your wallet with USDC on Base to continue."
    );
    e.code = "x402_insufficient_funds";
    return e;
  }
  const firstLine = msg.split("\n").find((l) => l.trim()) || msg;
  const e = new Error(`x402 payment failed: ${firstLine.trim()}`);
  e.code = "x402_payment_failed";
  return e;
}

export async function getX402Fetch() {
  if (_x402Fetch) return _x402Fetch;
  const walletPrivateKey = process.env.WALLET_PRIVATE_KEY || "";
  if (!walletPrivateKey) {
    throw new Error(
      "x402 mode requires a private key. Set WALLET_PRIVATE_KEY."
    );
  }
  const { wrapFetchWithPayment, x402Client } = await import("@x402/fetch");
  const { registerExactEvmScheme } = await import("@x402/evm/exact/client");
  const { privateKeyToAccount } = await import("viem/accounts");
  const signer = privateKeyToAccount(walletPrivateKey);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });
  const inner = wrapFetchWithPayment(fetch, client);

  _x402Fetch = async (url, options) => {
    try {
      const response = await inner(url, options);
      process.stderr.write("  \x1b[2m↳ Paid $0.01 via x402 (Base)\x1b[0m\n");
      return response;
    } catch (err) {
      throw normalizeX402Error(err);
    }
  };

  return _x402Fetch;
}

export function isX402Enabled() {
  return process.env.ZERION_X402 === "true";
}
