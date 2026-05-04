import { print, printError } from "../../utils/common/output.js";

const DEFILLAMA = "https://api.llama.fi";
const YIELDS = "https://yields.llama.fi";

const HELP = {
  usage: "zerion sendai-ideas [--info | --protocols | --yields] [options]",
  description:
    "Live data primitives for the zerion-sendai-ideas skill (idea discovery, validation, landscape, DeFi research). The skill drives interview/scoring/validation prompts; this command exposes the DefiLlama fetches it calls into.",
  modes: {
    "--info": "Print skill metadata (modes, CLI primitives) for agent discovery",
    "--protocols": "DefiLlama protocol TVL (--chain, --category, --limit, --sort tvl|change_1d|change_7d)",
    "--yields": "Yield pools (--chain, --apy-min, --tvl-min, --limit)",
  },
  examples: [
    "zerion sendai-ideas --info",
    "zerion sendai-ideas --protocols --chain solana --limit 10",
    "zerion sendai-ideas --protocols --chain base --sort change_7d",
    "zerion sendai-ideas --yields --chain solana --apy-min 5",
  ],
  source: {
    skill: "skills/zerion-sendai-ideas/SKILL.md",
    upstream: "https://github.com/sendaifun/solana-new/tree/main/skills/idea (MIT)",
    data: "https://api.llama.fi (no API key required)",
  },
};

const INFO = {
  ok: true,
  skill: "zerion-sendai-ideas",
  modes: ["discover", "validate", "landscape", "defi-research"],
  cli_primitives: [
    "zerion sendai-ideas --protocols",
    "zerion sendai-ideas --yields",
  ],
  invoke:
    "Use the zerion-sendai-ideas skill in your AI agent (Claude Code, Codex, Gemini, etc.). The skill calls into the cli_primitives above for live data.",
  upstream: "https://github.com/sendaifun/solana-new/tree/main/skills/idea",
};

export default async function sendaiIdeas(args, flags) {
  if (flags.help || flags.h) {
    print(HELP);
    return;
  }

  if (flags.info) {
    print(INFO);
    return;
  }

  try {
    if (flags.protocols) return await protocols(flags);
    if (flags.yields) return await yields(flags);
  } catch (err) {
    printError(err.code || "defillama_error", err.message);
    process.exit(1);
  }

  // No mode flag → help
  print(HELP);
}

async function fetchJson(url, errorCode = "defillama_error") {
  const res = await fetch(url);
  if (!res.ok) {
    throw Object.assign(
      new Error(`DefiLlama returned HTTP ${res.status} for ${url}`),
      { code: errorCode }
    );
  }
  return res.json();
}

function intFlag(flag, fallback) {
  const n = parseInt(flag, 10);
  return Number.isFinite(n) ? n : fallback;
}

function floatFlag(flag, fallback) {
  const n = parseFloat(flag);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeChain(input) {
  if (!input) return null;
  const map = {
    "binance-smart-chain": "BSC",
    bsc: "BSC",
    ethereum: "Ethereum",
    base: "Base",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
    polygon: "Polygon",
    avalanche: "Avalanche",
    gnosis: "Gnosis",
    scroll: "Scroll",
    linea: "Linea",
    "zksync-era": "zkSync Era",
    zora: "Zora",
    blast: "Blast",
    solana: "Solana",
  };
  const key = String(input).toLowerCase();
  return map[key] || input;
}

async function protocols(flags) {
  const list = await fetchJson(`${DEFILLAMA}/protocols`, "api_error");
  const chain = normalizeChain(flags.chain);
  const category = flags.category;
  const sort = flags.sort || "tvl";

  let filtered = list;
  if (chain) {
    filtered = filtered.filter(
      (p) => Array.isArray(p.chains) && p.chains.includes(chain)
    );
  }
  if (category) {
    filtered = filtered.filter(
      (p) => p.category && p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  filtered.sort((a, b) => (b[sort] ?? 0) - (a[sort] ?? 0));

  const limit = intFlag(flags.limit, 20);
  const out = filtered.slice(0, limit).map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category,
    tvl: p.tvl,
    change_1d: p.change_1d,
    change_7d: p.change_7d,
    chains: p.chains,
    url: p.url,
  }));

  print({
    chain: flags.chain ?? null,
    category: category ?? null,
    sort,
    count: out.length,
    total_matched: filtered.length,
    protocols: out,
  });
}

async function yields(flags) {
  const payload = await fetchJson(`${YIELDS}/pools`, "api_error");
  const pools = Array.isArray(payload) ? payload : payload.data || [];
  const chain = normalizeChain(flags.chain);
  const apyMin = floatFlag(flags["apy-min"], 0);
  const tvlMin = floatFlag(flags["tvl-min"], 0);

  let filtered = pools;
  if (chain) filtered = filtered.filter((p) => p.chain === chain);
  if (apyMin > 0) filtered = filtered.filter((p) => (p.apy ?? 0) >= apyMin);
  if (tvlMin > 0) filtered = filtered.filter((p) => (p.tvlUsd ?? 0) >= tvlMin);

  filtered.sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0));
  const limit = intFlag(flags.limit, 20);
  const out = filtered.slice(0, limit).map((p) => ({
    project: p.project,
    symbol: p.symbol,
    chain: p.chain,
    apy: p.apy,
    apy_base: p.apyBase ?? null,
    apy_reward: p.apyReward ?? null,
    tvl_usd: p.tvlUsd,
    pool_id: p.pool,
    stablecoin: p.stablecoin ?? null,
    il_risk: p.ilRisk ?? null,
    exposure: p.exposure ?? null,
  }));

  print({
    chain: flags.chain ?? null,
    apy_min: apyMin || null,
    tvl_min: tvlMin || null,
    count: out.length,
    total_matched: filtered.length,
    pools: out,
  });
}
