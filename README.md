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

Crust you never touched is forgotten the moment you move on — nothing carries
into the next layer unless you scratch it away completely first.

Each layer's surface material is spelled out in the crust itself; the name
scratches away right along with the rest of the layer.

A run ends in exactly one of three ways:

1. **Death** — a mine or a live circuit. Forfeits every tool found this run and
   all unbanked currency.
2. **Bail** — offered between layers. Banks currency, keeps tools and fragments.
3. **The Vault** at depth 50 — banks everything plus a bonus.

Currency, tools and fragment-set unlocks persist across runs. Dying never
touches the permanent bank or the sets.

## Shop

Between runs, spend banked currency on a loadout for the *next* run only —
whatever you buy is spent the instant that run starts, win or lose, and never
carries beyond it:

- **Skip Charge** — instantly clears a layer during the run, no loot or
  carry-over. Stacks up to 3.
- **Coin Multiplier** — ×1.25 every coin banked during the run.
- **Rent a tool** — any tool you haven't permanently found yet is usable for
  that one run, then reverts to locked. Only one rental at a time.
- **Second Wind** — evades death once during the run. Locked until you defuse
  10 mines (see Hazards); the achievement, once earned, stays unlocked
  forever, but the guard itself must be bought again for every run.

A "clear loadout" option refunds anything bought but not yet spent on a run.

## Materials

Depths 1–9 walk a fixed sequence, softest first: Topsoil, Cardboard, Sand, Clay,
Gravel, Chalk, Shale, Sandstone, Limestone. After that the layers cycle Basalt →
Granite → Quartzite → Obsidian → Ferrolith → Meteorite, getting harder each time
around. Hardness approaches a ceiling asymptotically rather than growing without
bound.

Obsidian, Ferrolith and reinforced plating can only be worked with specific
tools. Chalk and Quartzite are **fragile**: dig far enough and the floor gives
way mid-layer — a scripted fall-through that costs you the layer's remaining
loot but not the run. Meteorite doesn't work like the rest at all — see below.

Clearing enough bugs (see Collectibles) permanently folds a sixth material,
**Swarm Nest**, into the deep cycle.

## Tools

| tool | radius | shape | power | from depth | character |
| --- | --- | --- | --- | --- | --- |
| Bare Hand | 3.6 | round | ×1.0 | 1 | always there, never breaks |
| Worn Coin | 2.4 | wedge | ×1.5 | 1 | fine edge, safe on fragile crust |
| Scissors | 1.2 | wedge | ×1.1 | 2 | close a loop on paper-like crust to pop it out |
| Wire Brush | 5.6 | bar | ×1.6 | 3 | wide sweep, shatters fragile loot |
| Cold Chisel | 2.8 | wedge | ×3.2 | 5 | one of the two ways into obsidian or meteorite |
| Insulated Probe | 2.8 | round | ×2.0 | 8 | dead-shorts live circuits, pings nearby mines |
| Core Drill | 3.6 | round | ×6.0 | 15 | punches anything, wakes mines early |
| Dissolving Spray | 4.4 | gradient | ×2.1 | 1 | wide, soft-edged mist — earned, never found |

Tools are found buried in layers, the same way as currency. Tap the dock button
for a radial wheel — only tools you can actually carry this run appear on it,
nothing locked or not-yet-found. Time and input pause while it is open.

If a layer is gated behind a tool you do not hold, the generator buries one
within three layers of the gate, so a descent can never dead-end.

### Combining tools

The wheel is a toggle, not a single pick: tap any number of tools to carry
them all at once, and their effects multiply together into one blended tool —
power stacks as a straight product (Chisel ×3.2 with Core Drill ×6.0 makes a
×19.2 tool), radius averages across every component, and the footprint shape
follows whichever one hits hardest. Any special ability transfers too — carry
the Insulated Probe alongside anything else and you still short circuits and
ping mines; carry the Wire Brush alongside anything else and fragile loot
still shatters. The combo's name is a portmanteau of every tool's name —
Cold Chisel + Core Drill + Insulated Probe becomes "Chidriobe" — with a small
chip next to it counting how many are stacked. Equipping the Bare Hand always
clears the combo back down to just the hand, and picking any real tool always
drops the hand from the mix first.

### Cutting a loop with scissors

Drag with the scissors equipped and it cuts a thin line, same as any other
tool. On paper-like crust — Cardboard, so far — closing that line into a loop
pops the whole interior out instantly, integrity and loot alike — closing the
loop is itself the explicit action, so this is the one case where loot doesn't
need a separate tap. A mine or live circuit caught inside reacts exactly as
if you'd uncovered it with any other tool. On every other material the loop
trick simply doesn't work: the scissors just cut their usual thin line,
nothing more.

## Meteorite: a different kind of layer

Meteorite, out in the deep cycle, isn't crust at all — there's nothing to
scratch away. Instead the whole layer is a solid shell of triangular plates,
floating in space, that only the **Cold Chisel** or **Core Drill** can bite
into (carrying either as part of a combo is enough). Anything weaker just
bounces off with a spark.

Tap a still-solid plate and it splits into four smaller ones with a gap
opened up between them — those four are now **loose**: they drift slowly,
spin, and bounce off any other loose piece they touch, forever, until
something happens to them. Tap a loose piece again and it splits the same
way, smaller still. Once a piece is small enough — three splits down from
where it started — a tap **pops** it instead of splitting it, and it's gone
for good, with anything buried in that exact patch of rock (a coin, a
fragment, a tool) coming free right along with it.

A **swipe** never breaks or pops anything, however hard or fast it drags
across the field — it only shoves nearby loose pieces a little further in
the direction it's moving.

There's still a seam buried somewhere in the shell, same as any other layer.
It has no crust to thin, so instead it turns up the moment the one plate that
used to sit over it has finally been popped away — everything else in the
field can be left whole. Meteorite carries none of the usual mines or live
circuits.

## Hazards

- **Mines** don't go off the instant their core is uncovered anymore - they
  arm a 5-second fuse instead. The Core Drill arms one at roughly twice the
  remaining cover. An armed mine draws straight through solid crust: a
  pulsing core and a red ring that shrinks toward it as the fuse burns down,
  the pulse speeding up as it gets close - and beeping in time with every
  pulse, faster and higher-pitched the closer it gets to going off. Hold a
  thumb exactly over an armed mine (no thumb offset here - press precisely on
  it) and a subtle green bar near the top of the screen fills in as it
  defuses, taking 3 uninterrupted seconds; lift your finger before it
  completes and the bar empties, fuse still burning, so you may not make it
  back in time. A defused mine settles for good. One that isn't
  detonates: the screen shakes, a rough-edged crater is blasted into the
  crust around it, any nearby loot is thrown outward, and the death screen
  only appears once that settles. Every un-armed mine also sits under a red
  warning aura, buried at the same depth as the mine itself and wider than
  its icon, so scratching anywhere nearby shows a red hint before you reach
  the core; the aura shrinks the deeper you go, giving far less notice late
  in a descent. The Insulated Probe periodically pings, briefly showing every
  nearby un-armed mine's aura straight through solid crust. Defusing 10 mines
  across any number of runs permanently unlocks **Second Wind** in the shop —
  a one-time death-evading guard you can buy fresh for each run.
- **Live circuits** draw straight through the crust from the moment a layer
  loads — no digging needed to see where they run. Each wire cycles on its
  own random timer: energized (bright, dashed, dangerous) for 3-5 seconds,
  then dormant (dim, harmless) for 1.5-3. Scratching across it while thin and
  energized ends the run; while dormant, it's just a wire. The Insulated
  Probe still shorts one out for a bounty, but only while it's energized.
  Every layer with a circuit also buries one **off-switch**, hidden under the
  crust like ordinary loot. Dig it up and hold a thumb exactly on it (no
  offset) for 3 seconds to permanently kill every live circuit on the layer —
  sometimes the only way to safely reach a seam or loot a wire was guarding.

Density and lethality rise with depth. The vault carries none.

## Collectibles

Nothing is picked up just by uncovering it. Once digging has thinned the crust
enough to expose a coin, fragment or tool, a pulsing ring invites a tap — only
that tap actually loots it, with a short flourish and a HUD update. Progress
fragments belong to numbered sets and are still collected **silently** once
tapped — they are only revealed and tallied in the run report. Completing a
set is a permanent unlock:

| set | reward |
| --- | --- |
| Surveyor Plates | +25% currency value |
| Lantern Shards | seams read one cell wider |
| Glove Linings | the bare hand digs 60% harder |
| Vault Keys | runs begin at depth 3 |

Dirt layers can also have a handful of small, harmless bugs wandering across
them. Tapping one clears it; leaving it alone does nothing either way — they
are not a hazard. Kills are tallied **silently** across every run, and once
you've cleared 20 of them you permanently earn the **Dissolving Spray** tool
and the **Swarm Nest** material joins the deep cycle for good.

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
starburst, crossed square), so colour is never the only channel.

`index.html?selftest` runs the same checks in the page. `index.html?debug`
exposes a small inspection hook used by the browser tests.
