import * as ows from "../lib/ows.js";
import { print, printError } from "../lib/output.js";
import { getConfigValue } from "../lib/config.js";

export default async function walletExport(args, flags) {
  const walletName = flags.wallet || args[0] || getConfigValue("defaultWallet");

  if (!walletName) {
    printError("no_wallet", "No wallet specified", {
      suggestion: "Use --wallet <name> or set default: zerion config set defaultWallet <name>",
    });
    process.exit(1);
  }

  // Security warning
  process.stderr.write(
    "\n⚠️  WARNING: This will display your recovery phrase.\n" +
    "   Anyone with this phrase can control all funds in this wallet.\n" +
    "   Never share it. Never paste it into a website.\n\n"
  );

  try {
    const mnemonic = ows.exportWallet(walletName, flags.passphrase);
    const wallet = ows.getWallet(walletName);

    print({
      wallet: {
        name: wallet.name,
        evmAddress: wallet.evmAddress,
      },
      mnemonic,
    });
  } catch (err) {
    printError("ows_error", `Failed to export wallet: ${err.message}`, {
      suggestion: "Check wallet name with: zerion wallet list",
    });
    process.exit(1);
  }
}
