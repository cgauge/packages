# CustomerGauge Public Packages

- DTC - Declarative Test Cases
- DTC AWS Plugin - Interact with AWS services
- DTC MySQL Plugin - Interact and Mock MySQL calls
- DTC Playwright Plugin - Test Runner and Interaction
- Nock AWS - Helper to mock AWS API calls
- YAML - YAML parse with extra tags

## Build

From the repository root:

1. **Install dependencies** (once):

   ```bash
   npm install
   ```

2. **Build the whole monorepo** — runs dependency packages first (`log`, `assert`, `type-guard`, `dtc`), then every workspace that defines a `build` script:

   ```bash
   npm run build
   ```

3. **Build one package** — use the `name` from that package’s `package.json`:

   ```bash
   npm run build --workspace @cgauge/dtc
   npm run build --workspace @cgauge/dtc-aws-plugin
   ```

4. **Clean generated `dist` directories** (excluding `node_modules`):

   ```bash
   npm run clean
   ```

5. **Run tests** in all workspaces that define a `test` script:

   ```bash
   npm test
   ```

6. **Run tests for a single workspace** — use the package `name` from that workspace’s `package.json`:

   ```bash
   npm test --workspace @cgauge/dtc
   npm test --workspace @cgauge/dtc-aws-plugin
   ```

   Or from inside that package’s directory:

   ```bash
   cd dtc
   npm test
   ```

## Contributing

Contributions are always welcome, please have a look at our issues to see if there's something you could help with.

## License

All packages are licensed under LGPLv3 license.
