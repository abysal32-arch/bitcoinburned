# task-03 — v1.0.0 release + launch wrap

## Goal
With the domain live (task-01) and the burn proof in hand (task-02), cut the v1.0.0
release, point the README at the live site + proof, and hand Joe a launch announce.
This closes the launch round.

## Preconditions
- task-01 done: https://bitcoinburned.com serves with HTTPS enforced, live gate green.
- task-02 done: `tasks/task-02/PROOF.md` exists with a confirmed testnet4 burn txid.
- `package.json` version is already `1.0.0` (no bump needed — just tag).

## Steps
1. **README top-of-file update:** flip the "Status: pre-launch / staging preview" block to a
   live line — the canonical URL `https://bitcoinburned.com`, and a one-line "verified
   end-to-end" note with the task-02 testnet proof txid (+ its mempool.space/testnet4 link).
   Keep the safety-model section unchanged.
2. **BACKLOG.md** (repo root) already seeds post-launch work — review it, add anything the
   launch surfaced. Do NOT start backlog items; launch is the deliverable.
3. **Final smoke test on the live domain:** `node test/burn.test.js` green; working tree clean;
   homepage + tool 200; PSBT vector byte-identical in the live tool; console/network clean
   (homepage = mempool.space only, tool = zero).
4. **Tag + release:** `git tag v1.0.0` on the launch commit; push the tag. Optionally cut a
   GitHub Release (`gh release create v1.0.0`) with short notes: what it is, the safety model
   one-liner ("never touches your private key"), and the testnet proof txid.
5. Commit `task-03: v1.0.0 — README live URL + proof, tag, backlog`. Update STATUS (all ✅).

## Announce blurb for Joe (draft in the wrap-up message — 2–3 sentences, factual)
Include: what the site is, that the tool **never touches your private key** (builds an
unsigned PSBT you sign in your own wallet), and the live URL. Optionally the proof txid.

## Do NOT
- Start any BACKLOG item.
- Delete the staging Pages config or rewrite git history.

## Exit criteria
README shows the live URL + verified proof line; `v1.0.0` tagged + pushed; `BACKLOG.md` present;
final smoke test green; STATUS table all ✅ (3/3); Joe handed the announce blurb. **Launch complete.**
