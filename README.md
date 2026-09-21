# Deep Dig

A mobile-first, portrait, single-player, offline infinite-descent digging game.
Two files, no build step, no network, no dependencies:

| file | what it is |
| --- | --- |
| `index.html` | the whole game — markup, styles, generation core and run loop |
| `selftest.js` | headless fairness/legibility test, run with Node |

Open `index.html` in a browser (or serve the folder) and play. Everything is
stored in `localStorage`; nothing leaves the device.

## The loop

You descend through numbered layers with no upper bound. Each layer is one
surface of a material. Drag to scratch it away in a soft-edged radius around
your finger. Every layer hides **one seam**; expose it to reveal a star, then
tap the star to break the layer, regardless of how much crust is left. Every
10th layer is **reinforced**: there
is no seam to find, only a hidden channel to trace end to end without straying
past tolerance.

Crust you never touched is not free. Leftover resistance carries into the next
layer as extra hardness, capped so it can never more than double that layer's
base difficulty — so rushing to the seam borrows trouble from the layer below.

A run ends in exactly one of three ways:

1. **Death** — a mine or a live circuit. Forfeits every tool found this run and
   all unbanked currency.
2. **Bail** — offered between layers. Banks currency, keeps tools and fragments.
3. **The Vault** at depth 50 — banks everything plus a bonus.

Currency, tools and fragment-set unlocks persist across runs. Dying never
touches the permanent bank or the sets.

## Materials

Depths 1–8 walk a fixed sequence, softest first: Topsoil, Sand, Clay, Gravel,
Chalk, Shale, Sandstone, Limestone. After that the layers cycle Basalt →
Granite → Quartzite → Obsidian → Ferrolith, getting harder each time around.
Hardness approaches a ceiling asymptotically rather than growing without bound.

Obsidian, Ferrolith and reinforced plating can only be worked with specific
tools. Chalk and Quartzite are **fragile**: dig far enough and the floor gives
way mid-layer — a scripted fall-through that costs you the layer's remaining
loot but not the run.

## Tools

| tool | radius | shape | power | from depth | character |
| --- | --- | --- | --- | --- | --- |
| Bare Hand | 3.6 | round | ×1.0 | 1 | always there, never breaks |
| Worn Coin | 2.4 | wedge | ×1.5 | 1 | fine edge, safe on fragile crust |
| Wire Brush | 5.6 | bar | ×1.6 | 3 | wide sweep, shatters fragile loot |
| Cold Chisel | 2.8 | wedge | ×3.2 | 5 | one of the two ways into obsidian |
| Insulated Probe | 2.8 | round | ×2.0 | 8 | dead-shorts live circuits |
| Core Drill | 3.6 | round | ×6.0 | 15 | punches anything, wakes mines early |

Tools are found buried in layers, the same way as currency. Tap the dock button
for a radial wheel; time and input pause while it is open, and a swap changes
the removal radius, shape and speed of the very next stroke.

If a layer is gated behind a tool you do not hold, the generator buries one
within three layers of the gate, so a descent can never dead-end.

## Hazards

- **Mines** end the run the moment their core is uncovered. The Core Drill sets
  them off at roughly twice the remaining cover.
- **Live circuits** end the run if you scratch across one where the crust is
  already thin. The Insulated Probe shorts them out instead, and pays for it.

Density and lethality rise with depth. The vault carries none.

## Collectibles

Currency is picked up instantly with a short flourish and shows in the HUD.
Progress fragments belong to numbered sets and are collected **silently** —
they are only revealed and tallied in the run report. Completing a set is a
permanent unlock:

| set | reward |
| --- | --- |
| Surveyor Plates | +25% currency value |
| Lantern Shards | seams read one cell wider |
| Glove Linings | the bare hand digs 60% harder |
| Vault Keys | runs begin at depth 3 |

## Determinism and the self-test

Every layer — material, hardness, hazard placement, seam, loot — is generated
from `(seed, depth, carry)` with a seeded PRNG. Placement is constrained, not
merely random: the seam is never inside a hazard's danger radius, never inside
a live corridor, hazards keep their distance from each other, and loot keeps
clear of both. When a layer is too crowded to place a fair seam, the generator
drops hazards until it can — fairness wins over density.

```
node selftest.js [seeds] [maxDepth]     # defaults: 400 seeds, depths 1-50
```

The harness lifts the generation core straight out of `index.html`, so the test
can never drift from the shipped game. It simulates every seed at every depth
and checks:

- all minimum separations, per layer, including boss channels
- the seam exists, is inside the field, and is reachable
- hardness stays under its asymptote and carry-over never more than doubles a
  layer
- identical seeds give identical layers, different seeds do not
- boss depths are traceable and the ceiling is the vault
- tool pickups never appear above their own minimum depth
- a descent that collects what it finds can always clear what it meets
- **palette legibility** in normal vision and simulated protanopia,
  deuteranopia and tritanopia: every buried signal stays apart from every
  material, from each material's grain, from the substrate under the crust and
  from the other signals, and back-to-back layers stay apart from each other

The palette is measured, not asserted by eye — the material colours in
`index.html` were chosen by search against those constraints. Buried things are
also shape-coded (spiked disc, dashed line, ringed disc, diamond, hexagon,
starburst), so colour is never the only channel.

`index.html?selftest` runs the same checks in the page. `index.html?debug`
exposes a small inspection hook used by the browser tests.
