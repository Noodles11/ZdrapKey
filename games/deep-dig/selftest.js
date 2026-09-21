#!/usr/bin/env node
/*
 * Deep Dig - headless generator self-test.
 *
 * The game ships as one self-contained index.html. Rather than duplicating the
 * generator, this harness lifts the exact <script id="dig-core"> block out of
 * that file and exercises it, so the test can never drift from the game.
 *
 *   node games/deep-dig/selftest.js [seeds] [maxDepth]
 *
 * Exits non-zero if any layer violates the fairness constraints or the palette
 * loses separation under normal or dichromatic vision.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const start = html.indexOf('/*CORE-START*/');
const end = html.indexOf('/*CORE-END*/');
if (start < 0 || end < 0) {
  console.error('could not find the core block markers in index.html');
  process.exit(2);
}
const source = html.slice(start, end);
const DIG = new Function(source + '\nreturn DIG;')();

const seeds = Number(process.argv[2] || 400);
const maxDepth = Number(process.argv[3] || DIG.C.DEPTH_CEILING);

console.log(`Deep Dig self-test - ${seeds} seeds x depths 1..${maxDepth}`);

const t0 = Date.now();
const r = DIG.selfTest({ seeds, maxDepth });
const ms = Date.now() - t0;

/* --- extra invariants the in-game report summarises but does not enumerate --- */
const extra = [];

// 1. Hardness must stay bounded (asymptotic, never runaway) and carry-over
//    must never more than double a layer's base difficulty.
let prevBase = 0;
for (let d = 1; d <= 400; d++) {
  const h = DIG.hardnessForDepth(d);
  if (!isFinite(h) || h > DIG.hardnessCeiling() + 1e-6) {
    extra.push(`depth ${d}: hardness ${h.toFixed(2)} broke the asymptote ${DIG.hardnessCeiling().toFixed(2)}`);
    break;
  }
  prevBase = h;
}
{
  const L = DIG.genLayer('carry-probe', 25, 9999);
  if (L.hardness > L.baseHardness * 2 + 1e-6) extra.push('carry-over cap failed: ' + L.hardness + ' vs ' + L.baseHardness);
}

// 2. Determinism: same seed + depth must produce byte-identical layers.
{
  const a = JSON.stringify(DIG.genLayer('det', 17, 1.25));
  const b = JSON.stringify(DIG.genLayer('det', 17, 1.25));
  if (a !== b) extra.push('generation is not deterministic for a fixed seed/depth');
  const c = JSON.stringify(DIG.genLayer('det2', 17, 1.25));
  if (a === c) extra.push('different seeds produced identical layers');
}

// 3. Every boss depth must actually be a traceable boss layer, and the vault
//    must be reachable and hazard-free.
{
  for (let d = DIG.C.BOSS_INTERVAL; d < DIG.C.DEPTH_CEILING; d += DIG.C.BOSS_INTERVAL) {
    const L = DIG.genLayer('boss-probe', d, 0);
    if (!L.isBoss || !L.path) extra.push(`depth ${d} should be a boss layer`);
  }
  const V = DIG.genLayer('vault-probe', DIG.C.DEPTH_CEILING, 0);
  if (!V.isVault) extra.push('depth ceiling is not the vault layer');
  if (V.hazards.length) extra.push('vault layer contains hazards');
}

// 4. Every material must be clearable by at least one tool that is equippable
//    at the shallowest depth the material can appear.
{
  Object.keys(DIG.MATERIALS).forEach((id) => {
    const mat = DIG.MATERIALS[id];
    const usable = DIG.TOOLS.filter((t) => DIG.toolAffinity(t.id, mat) >= 0.5);
    if (!usable.length) extra.push(`material ${mat.name} has no viable tool`);
  });
  // find the first depth each gated material appears and make sure the gate
  // opens at or before it
  for (let d = 1; d <= DIG.C.DEPTH_CEILING; d++) {
    const mat = DIG.materialForDepth(d);
    if (!mat.requires) continue;
    const ok = mat.requires.some((tid) => DIG.TOOL_BY_ID[tid].minDepth <= d);
    if (!ok) extra.push(`depth ${d} (${mat.name}) requires a tool that cannot be equipped yet`);
  }
}

// 5. Tool pickups must never be offered above their own minimum depth.
{
  let bad = 0;
  for (let s = 0; s < 120; s++) {
    for (let d = 1; d <= maxDepth; d++) {
      const L = DIG.genLayer('tool-probe-' + s, d, 0);
      L.items.forEach((it) => {
        if (it.kind === 'tool' && DIG.TOOL_BY_ID[it.toolId].minDepth > d) bad++;
      });
    }
  }
  if (bad) extra.push(`${bad} tool pickups appeared above their minimum depth`);
}

// 6. Playability: a descent that picks up every tool it uncovers must never
//    hit a layer it cannot realistically clear. This is what actually proves
//    the gated materials ("only this tool gets through") stay fair.
{
  let worst = { seconds: 0, depth: 0, tool: null };
  let stuck = 0;
  for (let s = 0; s < 60; s++) {
    const seed = 'play-' + s;
    const owned = { hand: true };
    let carry = 0;
    for (let d = 1; d <= DIG.C.DEPTH_CEILING; d++) {
      const pool = DIG.TOOLS.map((t) => t.id).filter((id) => !owned[id]);
      const L = DIG.genLayer(seed, d, carry, { toolPool: pool, owned });
      if (!L.isBoss) {
        const best = DIG.bestToolAtDepth(L, owned);
        if (best.seconds > worst.seconds) worst = { seconds: best.seconds, depth: d, tool: best.toolId };
        if (best.seconds > 90) {
          stuck++;
          if (stuck < 4) extra.push(`${seed} depth ${d} (${L.material.name}): best owned tool ` +
            `${best.toolId} needs ~${best.seconds.toFixed(0)}s - unplayable`);
        }
      }
      // the simulated player collects whatever the layer buried
      L.items.forEach((it) => { if (it.kind === 'tool') owned[it.toolId] = true; });
      carry = Math.min(L.baseHardness, L.baseHardness * DIG.C.CARRY_FACTOR * 0.5);
    }
  }
  console.log(`worst realistic clear : ~${worst.seconds.toFixed(0)}s at depth ${worst.depth} with ${worst.tool}`);
}

/* --- report --- */
const pad = (s) => String(s).padEnd(22, ' ');
console.log(pad('layers simulated') + r.layers);
console.log(pad('layers with issues') + r.badLayers);
console.log(pad('layers without target') + r.targetless);
console.log(pad('worst hardness seen') + r.worstHardness.toFixed(2) + '  (cap ' + r.hardnessCeiling.toFixed(2) + ')');
console.log(pad('palette issues') + r.paletteIssues.length);
console.log(pad('extra invariants') + (extra.length ? extra.length + ' FAILED' : 'ok'));
console.log(pad('elapsed') + ms + 'ms');

if (r.issues.length) {
  console.log('\nlayer issues (first 20):');
  r.issues.slice(0, 20).forEach((i) => console.log('  ' + i));
}
if (r.paletteIssues.length) {
  console.log('\npalette issues (first 20):');
  r.paletteIssues.slice(0, 20).forEach((i) => console.log('  ' + i));
}
if (extra.length) {
  console.log('\nextra invariant failures:');
  extra.forEach((i) => console.log('  ' + i));
}

const ok = r.ok && extra.length === 0;
console.log('\n' + (ok ? 'PASS' : 'FAIL'));
process.exit(ok ? 0 : 1);
