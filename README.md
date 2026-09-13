# Repo Goblin 🧌

Repo Goblin is a small, read-only repository investigation agent built as a weekend project for exploring:

* Agentic workflows
* Agent loops
* Harness engineering
* Model Context Protocol (MCP)
* OpenAI tool calling
* Operational budgets and observability

Given a repository path, the goblin explores the project using controlled MCP tools and produces a summary based on the files it inspected.

## How it works

Repo Goblin consists of:

* An MCP server that exposes repository tools.
* An MCP client that discovers and calls those tools.
* An OpenAI-powered agent loop that decides what to inspect.
* A harness that validates tool calls, enforces limits, and records metrics.

The model proposes actions, but the harness decides which capabilities are available and executes them within a restricted repository boundary.

## Available tools

The MCP server currently provides three read-only tools:

* `list_files` — lists files inside the target repository.
* `read_file` — reads a UTF-8 file inside the repository.
* `search_code` — searches repository text using ripgrep.

File access is restricted to the configured repository root. Path traversal and symbolic-link escapes are checked before files are read.

## Agent loop

The investigation follows a bounded loop:

1. The model receives the task and available tool definitions.
2. The model requests one or more tools.
3. Repo Goblin validates and executes the requested tools through MCP.
4. Tool results are returned to the model.
5. The process repeats until the model produces a final answer or reaches an operational limit.

Repo Goblin also records:

* Model request count
* Total tool calls
* Usage count per tool
* Total elapsed time

## Requirements

* Node.js
* npm
* An OpenAI API key
* [ripgrep](https://github.com/BurntSushi/ripgrep)

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
OPENAI_API_KEY=your-api-key
OPENAI_API_MODEL=your-model
```

Do not commit the `.env` file.

## Usage

Run the repository investigator against another local repository:

```bash
npm run dev:client -- ../path-to-repository
```

Example:

```bash
npm run dev:client -- ../comboforge
```

Run only the MCP server:

```bash
npm run dev:server -- ../path-to-repository
```

Type-check the project:

```bash
npm run typecheck
```

Build it:

```bash
npm run build
```

## Current scope

Repo Goblin is intentionally small and read-only.

It currently runs a predefined repository investigation task and cannot modify files, execute repository code, or create commits.

Possible future additions include:

* Custom investigation prompts through CLI arguments
* Additional repository tools
* File-size and context budgets
* Improved error and run reporting
* Tests for tools and agent-loop behavior
* Human approval for higher-risk capabilities

## Why “Repo Goblin”?

Because it scurries through a repository, examines whatever looks interesting, and returns with a suspiciously organized pile of information.
