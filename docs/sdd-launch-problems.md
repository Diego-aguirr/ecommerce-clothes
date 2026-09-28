# Why SDD launches keep failing

**Date**: 2026-09-27
**Repo**: `new-ecommerce-java` (project `ecommerce-clothes`), branch `fix/mp-webhook-and-double-charge`
**Tooling**: `gentle-ai` 3.7.0, `engram` 2.2.1, OpenCode `1.18.32`
**Scope**: diagnosis only. No configuration or source file was changed while producing this document.

---

## TL;DR

There are **four independent failures**, and only the first one is what actually blocks every SDD phase launch.

| # | Cause | Blocks | Severity |
|---|-------|--------|----------|
| 1 | `openspec/config.yaml` is missing, so the native dispatcher defaults to store `openspec`, which is empty | Every phase (`sdd-continue` refuses) | **Root cause** |
| 2 | The orchestrator writes the `## SDD Session Preflight` block itself; the dispatch guard rejects model-authored preflight text | Child dispatch | High |
| 3 | The Engram MCP connection drops mid-session | Preflight cache, init guard, artifact reads | Medium |
| 4 | OpenCode free-tier HTTP 403 on subagents (already patched once, watch for recurrence) + `gpt-5.4-nano` "Insufficient account funds" | Subagent tasks, title generation | Medium |

---

## 1. Root cause: the workspace no longer declares its artifact store

### What the native dispatcher says right now

```
gentle-ai sdd-status mercadopago-production-readiness \
  --cwd /home/clyde/Documentos/work/new-ecommerce-java --json --instructions
```

```json
{
  "schemaName": "gentle-ai.sdd-status",
  "schemaVersion": 2,
  "artifactStore": "openspec",
  "planningHome": { "mode": "repo-local", "path": ".../new-ecommerce-java/openspec" },
  "artifacts": { "proposal": "missing", "specs": "missing", "design": "missing",
                 "tasks": "missing", "applyProgress": "missing", "verifyReport": "missing" },
  "dependencies": { "proposal": "blocked", "specs": "blocked", "design": "blocked",
                    "tasks": "blocked", "apply": "blocked", "verify": "blocked", "archive": "blocked" },
  "nextRecommended": "sdd-new",
  "blockedReasons": [ "Active OpenSpec change not found: mercadopago-production-readiness." ]
}
```

Every dependency is `blocked`, so `gentle-ai sdd-continue` has nothing to route to. The dispatcher
correctly tells the orchestrator to start over with `sdd-new` — but the change already exists.

### Why the store resolves to `openspec`

The native dispatcher reads the store the workspace **declares** in `openspec/config.yaml`.
That file does not exist in this checkout:

```
$ ls openspec/
ls: cannot access '.../new-ecommerce-java/openspec': No such file or directory
```

It was removed on purpose:

```
$ git log --diff-filter=D -- 'openspec/*'
aa8eff0  Diego-aguirr  Tue Aug 4 18:11:48 2026 -0300  Delete openspec directory
         openspec/config.yaml | 61 ------------------- (61 deletions)
```

With no declaration present, the dispatcher falls back to its default store: `openspec`,
`planningHome = <repo>/openspec`. That directory is also gone, so no change can ever be found.

### Where the artifacts actually live

The real artifacts are in **Engram**, not on disk:

| Artifact | Engram topic key | Observation |
|---|---|---|
| Exploration | `sdd/mercadopago-production-readiness/explore` | #368 |
| Proposal | `sdd/mercadopago-production-readiness/proposal` | #370 |
| Specs | `sdd/mercadopago-production-readiness/spec` | #372 |

Observation #372 states it explicitly: *"`openspec/` absent in this repo — filesystem mirror NOT
written, Engram-only is the accepted degradation"*.

The session preflight had cached `artifact_store = hybrid`, but the orchestrator's cached choice is
**not** what the native dispatcher reads. The dispatcher contract is one-directional:

> A declared store is authoritative in both directions: it selects the resolver, and an empty
> declared store reports as empty rather than silently serving the other store's artifacts.

So Engram artifacts are invisible to native status, native reports "change not found", and every
phase launch is refused. This is the mismatch you have been hitting.

### Reproduction (isolated, reproducible)

Verified in a throwaway git repo under `/tmp/opencode/sdd-store-test`:

| `openspec/config.yaml` content | Reported `artifactStore` |
|---|---|
| *(file absent)* | `openspec` ← **current repo state** |
| `mode: engram` | `openspec` |
| `mode: hybrid` | `openspec` |
| `store: engram` | `openspec` |
| `sdd: engram` | `openspec` |
| **`artifact_store: engram`** | **`engram`** |
| **`sdd:\n  artifact_store: engram`** | **`engram`** |
| **`artifact_store: hybrid`** | **`hybrid`** |
| `artifact_store: none` | `openspec` (falls back) |

**Gotcha worth remembering:** the declaring key is `artifact_store` (top-level or under `sdd:`).
The old `config.yaml` used `mode: openspec`, which is a *different, legacy* key. **Restoring the
deleted file verbatim would not fix anything** — it contains no `artifact_store` line.

*Verified*: the key flips `artifactStore`.
*Not yet verified*: that native then resolves Engram-stored artifacts end-to-end. That step must be
tested after the declaration is restored; do not assume it.

### Fix options

| Option | What it does | Tradeoff |
|---|---|---|
| **A. Declare `artifact_store: engram`** (recommended) | Recreate a minimal `openspec/config.yaml` with only the declaration; artifacts stay in Engram | `openspec/` is gitignored (`.gitignore:82`), so the declaration is local to this machine — every fresh clone must recreate it |
| **B. Declare `artifact_store: hybrid`** | Same, but native also looks for on-disk mirrors under `openspec/changes/` | Same gitignore tradeoff; native will report the on-disk half as empty |
| **C. Move back to the `openspec` store for real** | Recreate `openspec/changes/<change>/…` from the Engram artifacts | Conflicts with the standing preference that SDD artifacts stay gitignored and out of the repo |

None of these was applied — this document is diagnosis only.

---

## 2. The dispatch guard rejects a preflight block the model writes itself

The binary contains the refusal verbatim:

```
SDD child dispatch refused: model-authored preflight text cannot create parent-confirmed authority.
```

and the placeholder it expects instead:

```
{{GENTLE_AI_SDD_SESSION_PREFLIGHT_AUTHORITY}}
```

The rule: only the runtime may prepend the canonical `## SDD Session Preflight` block. When the
orchestrator copies that heading into a sub-agent prompt, the guard refuses the dispatch, because a
model cannot manufacture the authority it is supposed to have collected from you.

This is what produced the earlier "model-authored-preflight-block dispatch refusals" (Engram #371).
The behaviour looked *inconsistent* — some retries passed with the block still present — which made
it look random. It is not random; it is a guard that only fires on a prompt shape it can attribute to
the model, so it can be missed on some prompt variants.

**Workaround already in use** (Engram #371): launch phases via the raw `task` tool with the preflight
values passed as plain config lines, never as a `## SDD Session Preflight` block.

---

## 3. Engram MCP drops mid-session

```
2026-09-27T10:44:58.884Z level=WARN message="MCP connection closed" server=engram
2026-09-26T14:40:52.383Z level=WARN message="MCP connection closed" server=engram
```

Two occurrences in `~/.local/share/opencode/log/opencode.log`. Engram backs the preflight cache, the
`sdd-init` guard, and every Engram-store artifact read, so a drop at the wrong moment looks exactly
like "SDD refuses to start" while actually being a transport failure.

`gentle-ai doctor` currently reports `engram:reachable OK` — the failure is intermittent, not
persistent, which is what makes it confusing.

---

## 4. Subagent transport and model-account errors

### OpenCode free-tier 403

```
AI_APICallError: OpenCode's free tier can only be used from within OpenCode
```

Hit by `explore`, `review-risk`, `review-resilience`, `review-readability`, `review-reliability`
subagents. 17 occurrences total (runs `d2eddd5e`, `5e591b6f`), last one
`2026-09-27T09:13:38Z`.

**Status**: patched on 2026-09-27 06:17 local by exposing `bash` and `read` as `{"*": "ask"}` for the
nine affected agents in `~/.config/opencode/opencode.jsonc` (Engram #366). No recurrence after the
patch — but it previously looked "fixed" once, so re-check this log line if SDD dispatch fails again
with an empty error.

### Model account balance

```
2026-09-27T09:34:29Z  agent=title  modelID=gpt-5.4-nano
  error="AI_APICallError: Upstream request failed: Insufficient account funds"
2026-09-27T10:46:47Z  (same)
2026-09-27T10:54:58Z  (same)
```

Currently confined to the cosmetic `title` agent, but it is the same provider the small/cheap SDD
profiles would use. If a `*-cheap` phase profile routes to `gpt-5.4-nano`, it will fail the same way.

---

## Decision path for the next launch attempt

1. **Fix #1 first** — without a declared store, nothing else matters. Recreate a minimal
   `openspec/config.yaml` containing `artifact_store: <engram|hybrid>` and re-run
   `gentle-ai sdd-status mercadopago-production-readiness --json` to confirm `artifactStore` flips
   and `blockedReasons` clears.
2. **Confirm step 1 really reaches Engram** — if `artifactStore` flips but artifacts still read
   `missing`, the Engram resolver is not seeing topic keys `sdd/<change>/*`; stop and re-diagnose
   instead of falling back to a local store.
3. **Never author the `## SDD Session Preflight` block** in a child prompt (cause #2).
4. **If a launch fails with no useful error**, check `MCP connection closed server=engram` in
   `~/.local/share/opencode/log/opencode.log` before assuming an SDD contract problem (cause #3).

---

## Evidence index

| Evidence | Location |
|---|---|
| Native status showing `artifactStore: openspec` + all-blocked | `gentle-ai sdd-status mercadopago-production-readiness --json` run 2026-09-27 |
| Deletion of the declaration file | `git show aa8eff0` (2026-08-04, 61 lines removed) |
| Old declaration lacked `artifact_store` | `git show aa8eff0^:openspec/config.yaml` → `mode: openspec` |
| `artifact_store` is the declaring key | isolated repro, `/tmp/opencode/sdd-store-test` |
| Dispatch refusal string | `strings gentle-ai \| grep 'model-authored preflight'` |
| Preflight-block refusals in practice | Engram #371 |
| Engram artifacts for the change | Engram #368, #370, #372 |
| Engram MCP drops | `~/.local/share/opencode/log/opencode.log` lines 1027, 7100 |
| Free-tier 403 + patch | Engram #363, #366; log lines 737–2616 |
| `sdd.artifact_store` guidance string | `strings gentle-ai` → *"Populate the declared store, correct the inferred project, or change `sdd.artifact_store` to match where the work lives."* |
