/**
 * Centralized error catalog — every error includes an actionable suggestion.
 */

const ERRORS = {
  missing_api_key: {
    message: "ZERION_API_KEY is required",
    suggestion: "Get one at https://developers.zerion.io, then: zerion config set apiKey <key>",
  },
  missing_wallet: {
    message: "No wallet specified",
    suggestion: "Use --wallet <name> or: zerion config set defaultWallet <name>",
  },
  no_wallet: {
    message: "No wallet specified",
    suggestion: "Create one first: zerion wallet create",
  },
  wallet_not_found: {
    message: "Wallet not found",
    suggestion: "List wallets with: zerion wallet list",
  },
  insufficient_funds: {
    message: "Insufficient balance for this transaction",
    suggestion: "Fund your wallet: zerion wallet fund",
  },
  no_route: {
    message: "No swap route found",
    suggestion: "Check token names: zerion search <token>. Try a different chain with --chain",
  },
  invalid_token: {
    message: "Could not resolve token",
    suggestion: "Search for it: zerion search <query>",
  },
  swap_failed: {
    message: "Swap transaction failed on-chain",
    suggestion: "Check the transaction on a block explorer",
  },
  approval_failed: {
    message: "ERC-20 approval transaction failed",
    suggestion: "Try again or check gas balance",
  },
  api_error: {
    message: "Zerion API request failed",
    suggestion: "Check your API key and try again",
  },
  chain_not_supported: {
    message: "Chain not supported",
    suggestion: "List supported chains: zerion chains",
  },
  simulation_warning: {
    message: "Transaction simulation flagged a risk",
    suggestion: "Review the warning details before proceeding",
  },
  ows_error: {
    message: "Wallet operation failed",
    suggestion: "Check OWS vault status or re-create wallet",
  },
  missing_args: {
    message: "Missing required arguments",
    suggestion: "Run with --help for usage",
  },
  unknown_command: {
    message: "Unknown command",
    suggestion: "Run zerion --help to see available commands",
  },
};

export function getError(code) {
  return ERRORS[code] || { message: "An unexpected error occurred", suggestion: "Please try again" };
}

export function formatError(code, message, details = {}) {
  const template = ERRORS[code];
  return {
    error: {
      code,
      message: message || template?.message || "Unknown error",
      suggestion: details.suggestion || template?.suggestion,
      ...details,
    },
  };
}
