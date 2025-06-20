# FemmeCP

> do androids dream of electric estradiol?

help i trans'd AGI :uwu:

## Development

To get started, clone the repository and install the dependencies.

```bash
git clone https://github.com/punkpeye/fastmcp-boilerplate.git
cd femmecp
bun install
bun run dev
```

> [!NOTE]
> If you are starting a new project, you may want to fork [femmecp](https://github.com/punkpeye/femmecp) and start from there.

### Start the server

If you simply want to start the server, you can use the `start` script.

```bash
bun run start
```

However, you can also interact with the server using the `dev` script.

```bash
bun run dev
```

This will start the server and allow you to interact with it using CLI.

### Testing

A good MCP server should have tests. However, you don't need to test the MCP server itself, but rather the tools you implement.

```bash
bun run test
```

In the case of this MCP server, you can add tests for any tools you implement.

### Linting

Having a good linting setup reduces the friction for other developers to contribute to your project.

```bash
bun run lint
```

This boilerplate uses [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) and [TypeScript ESLint](https://typescript-eslint.io/) to lint the code.

### Formatting

Use `bun run format` to format the code.

```bash
bun run format
```

### GitHub Actions

This repository has a GitHub Actions workflow that runs linting, formatting, tests, and publishes package updates to NPM using [semantic-release](https://semantic-release.gitbook.io/semantic-release/).

In order to use this workflow, you need to:

1. Add `NPM_TOKEN` to the repository secrets
   1. [Create a new automation token](https://www.npmjs.com/settings/punkpeye/tokens/new)
   2. Add token as `NPM_TOKEN` environment secret (Settings → Secrets and Variables → Actions → "Manage environment secrets" → "release" → Add environment secret)
1. Grant write access to the workflow (Settings → Actions → General → Workflow permissions → "Read and write permissions")
