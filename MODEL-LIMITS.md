# Teaching-model limits

This project teaches with **simplified models**. Every simplification below is deliberate, but an electronics engineer, physicist or historian will spot each one. They are listed here first so reviewers can judge the material against what it claims to be, and so learners know where the models stop.

If you find a problem that isn't on this list, please open an issue. That is exactly the review this repo is for.

## Circuit solver (trainer)

| Simplification | What the real world does | Why we accept it for now |
|---|---|---|
| **Transistors are ideal switches.** Fully on when base–emitter voltage passes 0.6 V, with 25 Ω between collector and emitter; otherwise off. | A real bipolar transistor has a gain (β, typically 50–300), a linear region, saturation voltage, and draws base current. | The kit's projects use transistors as switches. The Learn app's transistor lesson shows gain separately. |
| **No base current.** The base draws nothing, so a resistor feeding a base never drops voltage. | A real base draws current and forms a divider with its resistor. | Matches switch-mode use; it does mean a very large base resistor still switches the transistor on, which a real one might not. |
| **LEDs and diodes are piecewise linear.** Off below a fixed threshold (LED 1.8 V, silicon 0.6 V), then a fixed resistance (28 Ω / 8 Ω). | A real diode follows the exponential Shockley equation; forward voltage varies with colour, current and temperature. | Gives correct on/off behaviour and realistic currents in the 1–30 mA range the kit uses. |
| **Capacitors are open circuits** in the breadboard solver. | Capacitors charge and discharge over time. | The solver is DC only. Timing projects (multivibrator, oscillators, tones, logic projects) run as **behaviour models**, and say so in the app. |
| **Behaviour-model projects** (kit #1, #24–29, #32) aren't wired on the board. | — | Queued: wire them for real so the solver and break-it mode cover them. |
| **The light sensor (CdS) is a smooth log curve**, 1 kΩ in full light to 1 MΩ in darkness. | Real CdS cells vary widely between parts, respond slowly, and have memory effects. | Captures the shape that matters: resistance falls by powers of ten as light rises. |
| **No component limits.** An LED drawing 257 mA is *flagged* as one that would burn out, but keeps working in the model. | It fails, usually open. | The break-it diagnosis explains the real outcome in words. |
| **No wire or contact resistance, no temperature effects.** | Breadboard contacts add a few tens of milliohms to ohms each, and warm parts change value. | Negligible at the kit's currents. |
| **X-ray view solves each wire as 1 mΩ** so every wire has its own current. | Real wires have resistance proportional to length and thickness. | Gives each wire a real current that obeys Kirchhoff's law, which is tested. |
| **Transistors remember their last on/off state** between solves, so circuits with two stable states (the L10 flip-flop) hold a bit. On power-up a flip-flop starts in a fixed state. | A real flip-flop powers up in an unpredictable state, decided by tiny differences between its parts. | The model's fixed start state keeps the lesson repeatable; the app says power-off wipes the memory, which is true. |
| **Meter** shows the voltage at the control-knob wiper only. | A real meter can be moved to any point. | A movable probe is on the queue. |
| **Mystery-fault probe** reads a point's voltage against the battery's negative, perfectly, without loading the circuit. | A real meter has input resistance (typically 10 MΩ) and its own probe placement errors. | Teaches the troubleshooting method; meter loading matters only in high-resistance circuits. |
| **Mystery faults** are only chosen if they change something you can see (an LED's brightness or a reading). | Real faults can be silent until something else fails. | A fault with no symptom can't be found by observation, so it would teach nothing. |

## Learn app simulations

- **Water/flow analogy.** Exact for steady DC through resistors; breaks for the cases the app itself flags (diodes, AC, fields).
- **Logic gates as liquid.** Solved as a real pressure network (the same maths as voltage). The gates are drawn as *resistor–transistor logic* style networks; modern chips use CMOS, which pulls outputs both up and down actively.
- **Speed of electricity.** Uses a typical signal speed of about 0.7 × the speed of light and a typical drift speed of 0.1 mm/s; real values depend on the wire and the current.
- **Series & parallel and Kirchhoff lessons** use ideal resistors and an ideal 9 V battery (no internal resistance), so the numbers are exact.
- **Transistor lesson.** Gain fixed at 100, capped at the load's limit.
- **I–V curves** are drawn in arbitrary units to show shape, not datasheet values.
- **Oscilloscope.** Signals are ideal (square edges are perfectly vertical). The capacitor curve is the exact exponential. The blinker's square wave is idealised; a real astable's waveforms have rounded edges.
- **Heron's cart** moves in exact straight lines and on-the-spot turns. A real rope-driven cart slips, coasts and turns through arcs; Heron's own design details are partly reconstructed by modern researchers.
- **Jacquard loom** shows one hook per column and one card per row of cloth, with a plain weave. Real Jacquard heads have hundreds of hooks and more complex weave structures.
- **Bootstrap ladder** machine codes are illustrative; each early computer had its own instruction set. The EDSAC letter codes shown are real in form.
- **Recall questions** test the app's own lessons, not every nuance of the field.

## History

- Stories are compressed for teaching. Dates are given to the precision the sources support; where sources disagree or a detail rests on one person's later account (for example Tesla's park vision, Nakamura's account of his employer), the text says so.
- Quoted words are attributed only where a source supports them. Claims that are often repeated but weakly sourced were left out (for example a commonly quoted line from Faraday's 1822 notebook).
- Sources used are listed in the changelog entries that introduced each story. Corrections with a better source are welcome.

## Code

- Each app is a **single, self-contained HTML file** with no build step or dependencies, by design: it must work offline from a phone. That makes the files long, with shared global state rather than modules.
- HTML is built with `innerHTML` only from the app's own fixed text, never from user input (the glossary search writes with `textContent`).
- Tests run in **jsdom**, not real browsers; layout and animation were checked separately with headless Chromium screenshots, which are not part of the automated suite.
- Accessibility is partial: controls are keyboard-reachable and motion can be reduced, but the SVG simulations don't describe their changing state to screen readers.
