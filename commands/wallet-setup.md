---
name: wallet-setup
description: Set up a new Zerion wallet with agent tokens and security policies
---

Guide the user through the complete wallet + agent setup flow.

## Steps

1. **Check prerequisites**:
   ```bash
   which zerion-cli || echo "Install: npm install -g zerion-cli"
   ```

2. **Check API key**:
   ```bash
   zerion-cli config list
   ```
   If no API key, instruct: `export ZERION_API_KEY="zk_dev_..."` (get from dashboard.zerion.io)

3. **Create wallet** (if needed):
   ```bash
   zerion-cli wallet create --name <name>
   ```
   The user will be prompted for a passphrase interactively.

4. **Set as default**:
   ```bash
   zerion-cli config set defaultWallet <name>
   ```

5. **Show funding addresses**:
   ```bash
   zerion-cli wallet fund
   ```

6. **Optional — Create agent token** (for unattended trading):
   ```bash
   zerion-cli agent create-token --name <bot-name> --wallet <wallet-name>
   ```
   Remind the user to save the token — it's shown only once.

7. **Optional — Create security policy**:
   ```bash
   zerion-cli agent create-policy --name <policy-name> --chains base,arbitrum --deny-transfers
   ```

Present each step clearly and wait for the user to complete interactive prompts (passphrase entry) before proceeding.
