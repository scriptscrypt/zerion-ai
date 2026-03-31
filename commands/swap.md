---
name: swap
description: Swap or bridge crypto tokens across chains
---

Help the user swap tokens using zerion-cli.

## Steps

1. Parse the swap request from `$ARGUMENTS`:
   - Identify: source token, destination token, amount
   - Optionally: source chain, destination chain

2. **Always get a quote first** (never execute without user confirmation):
   ```bash
   zerion-cli swap <from> <to> <amount>
   ```

3. Present the quote clearly:
   - Input amount and token
   - Output amount and token
   - Exchange rate
   - Estimated gas fees

4. If the user confirms, execute:
   ```bash
   zerion-cli swap <from> <to> <amount> --yes
   ```

5. For cross-chain swaps, add `--to-chain`:
   ```bash
   zerion-cli swap <from> <to> <amount> --to-chain <chain> --yes
   ```

## Safety Rules

- NEVER execute with `--yes` without showing the quote first and getting user confirmation
- If the amount seems unusually large, warn the user
- Always show the estimated output before execution
