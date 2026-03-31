/**
 * wallet analyze — full wallet analysis with parallel data fetching.
 * Returns a concise summary (portfolio, top positions, recent txs, PnL).
 */

import { fetchAPI } from "../lib/api-client.js";
import { print, printError } from "../lib/output.js";
import { isX402Enabled } from "../lib/x402.js";

function summarize(address, portfolio, positions, transactions, pnl) {
  const topPositions = Array.isArray(positions?.data)
    ? positions.data
        .sort((a, b) => (b.attributes?.value ?? 0) - (a.attributes?.value ?? 0))
        .slice(0, 10)
        .map((p) => ({
          name: p.attributes?.fungible_info?.name ?? p.attributes?.name ?? "Unknown",
          symbol: p.attributes?.fungible_info?.symbol ?? null,
          value: p.attributes?.value ?? 0,
          quantity: p.attributes?.quantity?.float ?? null,
          chain: p.relationships?.chain?.data?.id ?? null,
        }))
    : [];

  const recentTxs = Array.isArray(transactions?.data)
    ? transactions.data.slice(0, 5).map((tx) => ({
        hash: tx.attributes?.hash ?? null,
        status: tx.attributes?.status ?? null,
        mined_at: tx.attributes?.mined_at ?? null,
        operation_type: tx.attributes?.operation_type ?? null,
        fee: tx.attributes?.fee?.value ?? null,
        transfers: Array.isArray(tx.attributes?.transfers)
          ? tx.attributes.transfers.map((t) => ({
              direction: t.direction,
              fungible_info: t.fungible_info
                ? { name: t.fungible_info.name, symbol: t.fungible_info.symbol }
                : null,
              quantity: t.quantity?.float ?? null,
              value: t.value ?? null,
            }))
          : [],
      }))
    : [];

  return {
    wallet: { query: address },
    portfolio: {
      total: portfolio?.data?.attributes?.total?.positions ?? null,
      currency: "usd",
      change_1d: portfolio?.data?.attributes?.changes ?? null,
      chains: portfolio?.data?.attributes?.positions_distribution_by_chain ?? null,
    },
    positions: {
      count: Array.isArray(positions?.data) ? positions.data.length : 0,
      top: topPositions,
    },
    transactions: {
      sampled: Array.isArray(transactions?.data) ? transactions.data.length : 0,
      recent: recentTxs,
    },
    pnl: {
      available: Boolean(pnl?.data),
      summary: pnl?.data?.attributes ?? null,
    },
  };
}

export default async function walletAnalyze(args, flags) {
  const address = args[0] || flags.address;
  if (!address) {
    printError("missing_wallet", "A wallet address or ENS name is required.");
    process.exit(1);
  }

  const useX402 = flags.x402 === true || isX402Enabled();
  const addr = encodeURIComponent(address);
  const txLimit = flags.limit ? parseInt(flags.limit) : 10;

  const posParams = { "filter[positions]": "no_filter" };
  const txParams = { "page[size]": txLimit };
  if (flags.chain) {
    posParams["filter[chain_ids]"] = flags.chain;
    txParams["filter[chain_ids]"] = flags.chain;
  }
  if (flags.positions === "simple") posParams["filter[positions]"] = "only_simple";
  else if (flags.positions === "defi") posParams["filter[positions]"] = "only_complex";

  try {
    const results = await Promise.allSettled([
      fetchAPI(`/wallets/${addr}/portfolio`, {}, useX402),
      fetchAPI(`/wallets/${addr}/positions/`, posParams, useX402),
      fetchAPI(`/wallets/${addr}/transactions/`, txParams, useX402),
      fetchAPI(`/wallets/${addr}/pnl`, {}, useX402),
    ]);

    const labels = ["portfolio", "positions", "transactions", "pnl"];
    const values = results.map((r) => (r.status === "fulfilled" ? r.value : null));
    const failures = results
      .map((r, i) => (r.status === "rejected" ? labels[i] : null))
      .filter(Boolean);

    const summary = summarize(address, ...values);
    if (failures.length) summary.failures = failures;
    if (useX402) summary.auth = "x402";

    print(summary);
  } catch (err) {
    printError(err.code || "analyze_error", err.message);
    process.exit(1);
  }
}
