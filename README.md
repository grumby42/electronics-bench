# Electronics Bench

Two offline, single-file web apps for learning electronics from zero, built around the Maxitronix / Elenco **500-in-1 Electronic Lab** and sequenced alongside the U.S. Navy's free **NEETS** training series.

| App | What it is |
|---|---|
| [`electronics-basics.html`](electronics-basics.html) | **The course.** Notation first, then what electricity is, every core component with a live simulation, series and parallel, Kirchhoff's laws, four projects, logic gates as flowing liquid, a computing part (from clay tokens and Heron's rope-programmed cart to punched cards and the bootstrap ladder), the history of how each part came to be, recall checks, a glossary and a NEETS coverage tracker. |
| [`electronics-trainer.html`](electronics-trainer.html) | **The bench.** A functional recreation of the 500-in-1 lab panel: breadboard, battery taps, springs and modules, with a real DC circuit solver. Includes a **Lineage** track (from Volta's battery to the NOR gate that flew Apollo and the flip-flop that remembers), **break-it mode** (remove or short any part and get a diagnosis, or solve a hidden **mystery fault** with a voltage probe), and an **X-ray view** of the hidden strips and the current in every wire. |

Open [`index.html`](index.html) for a start page. No install, no network, no build step: download the files and open them in a browser. Keep both apps in the same folder so the course's "Build it for real" buttons can open projects on the bench.

## What's real and what's simplified

The trainer solves circuits with nodal analysis (the method professional circuit simulators are built on), and the course's simulations use real equations. Both are still **teaching models**: transistors are ideal switches, diodes are piecewise linear, and some projects run as behaviour models. Every simplification is listed in **[MODEL-LIMITS.md](MODEL-LIMITS.md)**. Please read it before reporting a "bug" in the physics, and please report anything that isn't on it.

## Tests

```
npm install
npm test
```

Eleven suites, about 130 checks, run in jsdom. They test behaviour against theory, not just that the page renders. For example: the capacitor reaches 63% at exactly one time constant, the blinker's measured period matches 0.69 RC, every logic gate's truth table emerges from the pipe-network physics, the X-ray view's wire currents obey Kirchhoff's current law, and a hidden open resistor reads 9 V before it and 0 V after it.

## Build IDs

Every response that changes a file stamps it with a build ID and an accurate UTC time in the file header (and the on-screen badge). See [CHANGELOG.md](CHANGELOG.md).

## Sources

History in the apps comes from the sources cited where each story was added (see the changelog). Corrections with a better source are welcome. NEETS itself is a U.S. Government work and in the public domain; this project draws on its structure, not its text.

## License

MIT — see [LICENSE](LICENSE).
