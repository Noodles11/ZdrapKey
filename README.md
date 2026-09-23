# ZdrapKey

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
2. **Bail** — available any time, mid-layer or not, no more waiting for a
   layer to clear. Banks currency, keeps tools and fragments, but a 10% toll
   is taken out of this run's coins first as the price of leaving on demand.
3. **The Vault** at depth 50 — banks everything plus a bonus.

Currency, tools and fragment-set unlocks persist across runs. Dying never
touches the permanent bank or the sets.

However a run ends, its report screen is set against a heatmap of every
layer that run actually cleared — every cell weighted by how many times a
stroke passed over it, cool blue through to a hot ember orange, faded in
behind the report itself. A layer abandoned mid-dig to a death or a bail
never makes it into the picture; only what got fully cleared, skipped or
fallen through does. It's rebuilt fresh for every run.

## Test mode

**Test mode**, from the title screen, is a sandbox: pick any surface in the
game — including ones you'd never normally hold a tool for yet, or that only
ever show up as a boss layer or the vault — and every layer generated from
then on is that same surface, at the hardness and hazard density it would
have at its normal depth. Every tool is available immediately, regardless of
depth or what you've actually found. Bail out any time, even mid-layer, not
just between layers.

Nothing here is ever kept: currency, fragments and tools picked up still
show the normal feedback in the moment, but none of it is banked, and
nothing counts toward bug kills, mine-defuse tallies or set completion. A
mine or a live circuit doesn't end anything either — it's just a dismissible
heads-up ("this would have ended a real run") that hands you a fresh layer
of the same surface once you tap through it.

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
Granite → Quartzite → Obsidian → Ferrolith → Meteorite → Glass → Mirror Rift,
getting harder each time around. Hardness approaches a ceiling asymptotically
rather than growing without bound.

Obsidian, Ferrolith and reinforced plating can only be worked with specific
tools. Quartzite is **fragile**: dig far enough and the floor gives way
mid-layer — a scripted fall-through that costs you the layer's remaining loot
but not the run. Chalk is soft rock, not fragile — it never collapses.
Meteorite and Glass don't work like the rest at all — see below. Water is
never in the rotation until you already carry a Spoon or Vacuum Cleaner — see
Liquid surfaces below. Mirror Rift digs like ordinary crust with any tool, but
echoes every stroke — see Mirror surfaces below.

Topsoil, Cardboard, Sand, Clay and Chalk are all **soft** ground — loose or
crumbly enough for the Sponge to wipe away in wide strokes.

Sand and Gravel are also **granular**: they obey gravity, column by column,
completely independently. Open any gap with solid ground still above it —
even a single dug-out dot — and half a second later everything sitting above
that gap in that one column slides down to fill it, uncovering fresh ground
at the very top of that column. A wide dig settles as many small, independent
falls rather than one uniform sheet, cascading roughly together but each
column on its own schedule. A mine or the seam can end up freshly exposed, or
freshly reburied, depending on where the sand settles.

Every other material scratches away with a soft-edged fade at the tool's
radius, but granular ground never does — the dig itself has a hard cutoff and
renders with a crisp, blocky edge instead of a blur, so a hole in sand or
gravel always reads as a sharp boundary rather than a gradient.

Clearing enough bugs (see Collectibles) permanently folds a sixth material,
**Swarm Nest**, into the deep cycle.

## Tools

| tool | radius | shape | power | from depth | character |
| --- | --- | --- | --- | --- | --- |
| Bare Hand | 3.6 | round | ×1.0 | 1 | always there, never breaks |
| Worn Coin | 2.4 | wedge | ×1.5 | 1 | fine edge, safe on fragile crust |
| Sponge | 6.2 | bar | ×1.4 | 1 | widest sweep there is, but only on soft ground |
| Scissors | 1.2 | wedge | ×1.1 | 2 | close a loop on paper-like crust to pop it out |
| Wire Brush | 5.6 | bar | ×1.6 | 3 | wide sweep, shatters fragile loot |
| Cold Chisel | 2.8 | wedge | ×3.2 | 5 | one of the two ways into obsidian or meteorite |
| Insulated Probe | 2.8 | round | ×2.0 | 8 | dead-shorts live circuits, pings nearby mines |
| Core Drill | 3.6 | round | ×6.0 | 15 | punches anything, wakes mines early |
| Dissolving Spray | 4.4 | gradient | ×2.1 | 1 | wide, soft-edged mist — earned, never found |
| Spoon | 2.0 | round | ×1.3 | 1 | scoops water cup by cup, almost useless on anything solid |
| Vacuum Cleaner | 5.5 | round | ×5.0 | 20 | drains a water layer dry in wide sweeps |

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

## Shatter surfaces: Meteorite and Glass

Meteorite and Glass, out in the deep cycle, aren't crust at all — there's
nothing to scratch away. Instead the whole layer is a solid shell of
triangular plates. Whole, unbroken plates sit edge to edge with no seam drawn
between them; the shell reads as one continuous surface until a plate
actually breaks off, at which point the gap it leaves is the only thing that
shows the pieces have separated.

A tap breaks everything within a small blast radius around it, not just the
one plate directly under your thumb — a single tap can split or pop several
neighboring plates at once. Each affected plate that's still whole splits
into four smaller ones with a gap opened up between them — one of those four
always shears off and pops instantly on the spot, gone for good before it
even has a chance to drift, while the other three are now **loose**. Tap a
loose piece again (or catch it in another tap's blast radius) and it splits
the same way, smaller still, until it's small enough to **pop** outright
instead — gone for good, with anything buried in that exact patch (a coin, a
fragment, a tool) coming free right along with it.

A **swipe** never breaks or pops anything, however hard or fast it drags
across the field — it only shoves nearby loose pieces a little further in
the direction it's moving. In **Meteorite**, loose pieces also drift and
spin on their own, tumbling gently and bouncing off each other forever until
something happens to them, the way real debris would in zero gravity. In
**Glass**, a loose piece just sits exactly where it cracked — no idle drift
or spin — until a swipe deliberately nudges it, after which it settles back
to rest.

There's still a seam buried somewhere in the shell, same as any other layer.
It has no crust to thin, so instead it turns up the moment the one plate that
used to sit over it has finally been popped away — everything else in the
field can be left whole. Neither material carries the usual mines or live
circuits.

The two differ only in how tough they are. **Meteorite** only yields to the
**Cold Chisel** or **Core Drill** (carrying either as part of a combo is
enough — anything weaker just bounces off with a spark), and a plate takes
two splits before a tap pops it. **Glass** gives way to any tool at all and
pops after just one split — the same mechanic, with much less resistance.
Glass also renders mostly transparent rather than a solid fill — both the
whole shell and any loose broken-off fragments — so the real ground and any
loot still buried underneath it actually read through, instead of it looking
like painted rock. Meteorite stays a solid, opaque shell floating in space.

## Liquid surfaces: Water

Water only ever turns up in the deep cycle for a player who already owns a
Spoon or a Vacuum Cleaner — without one of those two tools in your permanent
collection, a water layer simply never gets generated, so you're never stuck
facing one you cannot touch. Every other tool barely bites it (the same
"wrong tool" penalty obsidian or ferrolith give a tool outside their gate);
the Spoon works it at its normal rate for a slow, steady scoop, and the
Vacuum Cleaner — the ultimate answer to water — drains it in wide sweeps.

Scooping water never opens a discrete hole the way solid crust does. Instead
the whole layer gets more and more translucent together as the level drops,
letting you see the seam and any loot ghosting through what's left — but none
of it is actually reachable yet. Only once 90% of the layer's volume has been
taken out does it finally give way all at once: the seam can reveal, mines
arm, and buried loot becomes tappable, exactly like crust hitting its normal
reveal threshold.

## Mirror surfaces: Mirror Rift

Mirror Rift is ordinary crust in every way that matters for digging — any
tool bites it at its usual rate, nothing is gated behind a specific one. What
makes it different is that every tap or swipe is echoed 180° around the
field's exact centre point, at the same instant, with the same tool: a swipe
from left to right near the top comes out as a swipe from right to left near
the bottom, and a tap in one corner chips away the opposite corner too. A
faint dashed crosshair marks the reflection axis for as long as you're
digging one, and a ring shows exactly where the current stroke is echoing to.

The reflection only mirrors the *digging* — a mine, the seam, or a piece of
loot that ends up exposed on the far side arms or reveals normally (mines
still arm and the seam still checks every frame on both the stroke's own
point and its echo), but it still needs its own direct tap to be collected,
defused, or cleared. Half the layer is never more than a swipe away from
whatever you just did to the other half, so a stroke aimed only at clearing
your side can just as easily arm a mine, or crack open a seam, clear across
the field.

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
  Progress shows on the same top-of-screen bar a mine's defusing uses, just
  tinted the switch's own colour instead of green.

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
