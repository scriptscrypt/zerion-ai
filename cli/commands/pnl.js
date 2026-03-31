import * as api from "../lib/api-client.js";
import { print, printError } from "../lib/output.js";
import { resolveWallet, resolveAddress } from "../lib/resolve-wallet.js";
import { formatPnl } from "../lib/format.js";
import { isX402Enabled } from "../lib/x402.js";

export default async function pnl(args, flags) {
  const useX402 = flags.x402 === true || isX402Enabled();

  let walletName, address;
  if (args[0] && (args[0].startsWith("0x") || args[0].endsWith(".eth"))) {
    address = await resolveAddress(args[0]);
    walletName = args[0];
  } else {
    const resolved = resolveWallet(flags, args);
    walletName = resolved.walletName;
    address = resolved.address;
    if (resolved.needsResolve) {
      address = await resolveAddress(address);
    }
  }

  try {
    const response = await api.getPnl(address, { useX402 });
    const data = response.data?.attributes || {};

    const result = {
      wallet: { name: walletName, address },
      pnl: {
        totalGain: data.total_gain,
        realizedGain: data.realized_gain,
        unrealizedGain: data.unrealized_gain,
        totalGainPercent: data.relative_total_gain_percentage,
        totalInvested: data.total_invested,
        netInvested: data.net_invested,
        totalFees: data.total_fee,
      },
    };
    print(result, formatPnl);
  } catch (err) {
    printError(err.code || "pnl_error", err.message);
    process.exit(1);
  }
}
