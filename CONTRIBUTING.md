# Contributing

`zerion-ai` is maintained by the Zerion team.

## Scope

This repo is intentionally narrow:

- hosted Zerion MCP quickstarts
- one flagship skill: `wallet-analysis`
- a JSON-first CLI for OpenClaw-like environments
- minimal examples that stay easy to verify

Please prefer small, concrete improvements over broad abstractions.

## Development

```bash
npm test
node ./cli/zerion.js --help
```

## Contribution Guidelines

- Keep examples copy-pasteable.
- Prefer official Zerion naming and documented behavior.
- Document real gaps instead of inventing interfaces.
- Preserve JSON-first CLI output for agent compatibility.

## Issues And Questions

For Zerion API questions, start with the public docs:

- https://developers.zerion.io/reference/getting-started
- https://developers.zerion.io/reference/building-with-ai
