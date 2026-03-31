---
name: portfolio
description: Check a crypto wallet's portfolio value, positions, and PnL
---

Analyze the user's wallet portfolio. Use the zerion-cli to fetch data.

## Steps

1. Determine the wallet address or name:
   - If `$ARGUMENTS` contains an address (0x... or .eth), use it directly
   - If `$ARGUMENTS` contains a wallet name, resolve it via `zerion-cli wallet list`
   - If no arguments, use the default wallet from `zerion-cli config list`

2. Run the full analysis:
   ```bash
   zerion-cli wallet analyze <address> --pretty
   ```

3. Present the results in a clear summary:
   - Total portfolio value
   - Top positions by value
   - Recent transactions
   - PnL (profit/loss)

4. If the user asks for more detail, use specific commands:
   - `zerion-cli wallet positions <address> --positions defi` for DeFi positions
   - `zerion-cli wallet transactions <address> --limit 25` for more history
