---
name: portfolio
description: Check a crypto wallet's portfolio value, positions, and PnL
---

Analyze the user's wallet portfolio. Use the zerion to fetch data.

## Steps

1. Determine the wallet address or name:
   - If `$ARGUMENTS` contains an address (0x... or .eth), use it directly
   - If `$ARGUMENTS` contains a wallet name, resolve it via `zerion wallet list`
   - If no arguments, use the default wallet from `zerion config list`

2. Run the full analysis:
   ```bash
   zerion wallet analyze <address> --pretty
   ```

3. Present the results in a clear summary:
   - Total portfolio value
   - Top positions by value
   - Recent transactions
   - PnL (profit/loss)

4. If the user asks for more detail, use specific commands:
   - `zerion wallet positions <address> --positions defi` for DeFi positions
   - `zerion wallet transactions <address> --limit 25` for more history
