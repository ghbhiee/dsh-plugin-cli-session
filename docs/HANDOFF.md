# Handoff — dsh-plugin-cli-session

Continuation brief for a fresh session working on this repo. Read this, then
`~/dsh/PLAN-dsh-plugins.md` (design + 34-item pitfall list, local machine
only, NOT in git) and `~/dsh/OPS-dsh.md` (install/restart runbook). Public
repo: keep secrets out.

## What this is

A resume-capable headless CLI session runner for DeepSeek Harness — one
plugin serving what used to be two hand-maintained profiles (chat / api).
The flavour is pure config: `sessionTag` (e.g. `chat-cli` vs `api`),
`announceSessionId`, output format `text|json|stream-json`, plus
`-n/-r/-s/-w/-l` and `--json-schema` (which is prompt assembly, NOT a
generation-time constraint — the README says so honestly). This repo is the
standalone development home (split out of the old `dsh-plugins` monorepo).
Siblings: `dsh-plugin-workbench`, `dsh-plugin-mobile-shell`.

## Architecture

- `src/startup.ts` — cmdline declaration; keeps the deliberate
  `sandbox-policy` + `inject: [cliStartup]` ordering fix (`--workdir` chdir
  must happen before sandbox mounts).
- `src/index.ts` — the runner (host-only plugin; there is no client bundle).

## Hard constraints

- **Headless-style profiles only.** Installed into a web profile it owns the
  whole command line and rejects `dsh web`'s flags (it names itself in that
  error on purpose). Do not "fix" that by softening the parser.
- Functional plugin form: named exports only (`name`/`inject`/`Config`/
  `apply`), NEVER `export default` (the loader's unwrap would drop `inject`).
- dsh-cmdline's `parseCmdline` is typed against its own commander 8; this
  plugin brings its own commander — the readonly-only difference is bridged
  by a cast at the call site, by design.
- **lib/ is committed** (bare `github:ghbhiee/dsh-plugin-cli-session`
  installs serve it): rebuild + commit lib/ on every change, built from THIS
  repo's checkout.

## Build / verify loop

```sh
pnpm install
pnpm run check      # typecheck → vitest (41 tests) → tsdown build
```

Tests cover the runner's pure logic, the CLI argument contract, and
README-vs-code consistency (config fields + declared flags must be
documented). Real-machine verification: install into a scratch headless
profile (`dsh plugin --profile <p> add .`) and run a session end to end.
CI = `pnpm install --frozen-lockfile && pnpm run check`.
