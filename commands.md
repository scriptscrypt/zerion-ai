# Zerion CLI Commands

## Wallet Management

| Command | Description |
|---------|-------------|
| `zerion wallet create --name <name>` | Create encrypted wallet (EVM + Solana) |
| `zerion wallet import --name <name> --evm-key` | Import from EVM private key (interactive) |
| `zerion wallet import --name <name> --sol-key` | Import from Solana private key (interactive) |
| `zerion wallet import --name <name> --mnemonic` | Import from seed phrase (all chains) |
| `zerion wallet list` | List all wallets |
| `zerion wallet fund` | Show deposit addresses for funding |
| `zerion wallet backup --wallet <name>` | Export recovery phrase (mnemonic backup) |
| `zerion wallet delete <name>` | Permanently delete a wallet (requires passphrase) |
| `zerion wallet sync --wallet <name>` | Sync wallet to Zerion app via QR code |
| `zerion wallet sync --all` | Sync all wallets to Zerion app |

## Analysis

Accepts `0x...` address, ENS name (e.g., `vitalik.eth`), or local wallet name. Uses `--wallet` or default wallet if no argument given.

| Command | Description |
|---------|-------------|
| `zerion analyze <address\|name>` | Full analysis (portfolio, positions, txs, PnL in parallel) |
| `zerion portfolio <address\|name>` | Portfolio value and top positions |
| `zerion positions <address\|name>` | Token + DeFi positions |
| `zerion history <address\|name>` | Transaction history |
| `zerion pnl <address\|name>` | Profit & loss (realized, unrealized, fees) |

## Trading

All trading commands require an agent token. Transactions execute immediately.

| Command | Description |
|---------|-------------|
| `zerion swap <from> <to> <amount>` | Swap tokens |
| `zerion swap <from> <to> <amount> --chain <chain>` | Swap on specific chain |
| `zerion swap <from> <to> <amount> --to-chain <chain>` | Cross-chain swap |
| `zerion swap tokens [chain]` | List tokens available for swap |
| `zerion bridge <token> <chain> <amount> --from-chain <chain>` | Bridge tokens cross-chain |
| `zerion bridge <token> <chain> <amount> --from-chain <chain> --to-token <tok>` | Bridge + swap on destination |
| `zerion send <token> <amount> --to <address> --chain <chain>` | Send native or ERC-20 transfer |
| `zerion search <query>` | Search for tokens by name or symbol |

## Agent Tokens

Required for all trading commands. Token is saved to config automatically.

| Command | Description |
|---------|-------------|
| `zerion agent create-token --name <bot> --wallet <wallet>` | Create scoped API token (interactive policy setup) |
| `zerion agent create-token --name <bot> --wallet <wallet> --policy <id>` | Create with existing policy |
| `zerion agent list-tokens` | List agent tokens (shows active status) |
| `zerion agent use-token --wallet <wallet>` | Switch active agent token by wallet |
| `zerion agent revoke-token --name <bot>` | Revoke an agent token |

## Security Policies

Restrict what agent tokens can do. Attached at token creation time.

| Command | Description |
|---------|-------------|
| `zerion agent create-policy --name <policy>` | Create security policy |
| `zerion agent list-policies` | List all policies |
| `zerion agent show-policy <id>` | Show policy details |
| `zerion agent delete-policy <id>` | Delete a policy |

### Policy flags

| Flag | Description |
|------|-------------|
| `--chains <list>` | Restrict to specific chains (comma-separated) |
| `--expires <duration>` | Token expiry (e.g. `24h`, `7d`) |
| `--deny-transfers` | Block raw ETH/native transfers |
| `--deny-approvals` | Block ERC-20 approval calls |
| `--allowlist <addresses>` | Only allow interaction with listed addresses |

### Policy enforcement

| Rule | Enforced by | Works? |
|------|-------------|--------|
| `allowed_chains` | OWS (native) | Yes |
| `expires_at` | OWS (native) | Yes |
| `deny-transfers` | CLI (executable script) | Yes |
| `deny-approvals` | CLI (executable script) | Yes |
| `allowlist` | CLI (executable script) | Yes |

## Watchlist

| Command | Description |
|---------|-------------|
| `zerion watch <address> --name <label>` | Add wallet to watchlist (supports ENS) |
| `zerion watch list` | List watched wallets |
| `zerion watch remove <name>` | Remove from watchlist |

## Config

| Command | Description |
|---------|-------------|
| `zerion config set <key> <value>` | Set config value |
| `zerion config unset <key>` | Remove a config value (resets to default) |
| `zerion config list` | Show current configuration |

### Config keys

| Key | Description |
|-----|-------------|
| `apiKey` | Zerion API key |
| `defaultWallet` | Default wallet for all commands |
| `defaultChain` | Default chain (default: `ethereum`) |
| `slippage` | Default slippage % for swaps (default: `2`) |

## Other

| Command | Description |
|---------|-------------|
| `zerion chains` | List supported chains |
| `zerion --help` | Show full usage |
| `zerion --version` | Show version |

## Global Flags

| Flag | Description |
|------|-------------|
| `--wallet <name>` | Specify wallet (default: from config) |
| `--address <addr/ens>` | Use raw address or ENS name |
| `--watch <name>` | Use watched wallet by name |
| `--chain <chain>` | Specify chain (default: `ethereum`) |
| `--to-chain <chain>` | Destination chain for cross-chain swaps |
| `--from-chain <chain>` | Source chain for bridge commands |
| `--positions all\|simple\|defi` | Filter positions type |
| `--limit <n>` | Limit results (default: 10 for history, 20 for wallet list) |
| `--offset <n>` | Skip first N results (pagination) |
| `--search <query>` | Filter wallets by name or address |
| `--slippage <percent>` | Slippage tolerance (default: 2%) |
| `--timeout <seconds>` | Transaction confirmation timeout (default: 120s) |
| `--to <address>` | Recipient address for send command |
| `--to-token <token>` | Destination token for bridge + swap |
| `--x402` | Use x402 pay-per-call (no API key needed) |
| `--json` | JSON output (default) |
| `--pretty` | Human-readable output |
| `--quiet` | Minimal output |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZERION_API_KEY` | Yes (unless x402) | API key from dashboard.zerion.io |
| `ZERION_AGENT_TOKEN` | No | Agent token (overrides config) |
| `WALLET_PRIVATE_KEY` | Yes (for x402) | EVM private key for x402 payments on Base |
| `ZERION_X402` | No | Set `true` to enable x402 globally |
| `SOLANA_RPC_URL` | No | Custom Solana RPC endpoint |
| `ETH_RPC_URL` | No | Custom Ethereum RPC endpoint (ENS resolution) |

## Supported Chains

ethereum, base, arbitrum, optimism, polygon, binance-smart-chain, avalanche, gnosis, scroll, linea, zksync-era, zora, blast, solana
