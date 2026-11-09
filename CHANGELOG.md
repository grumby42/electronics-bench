# Changelog

Builds are stamped `build YYYY.MM.DD-n` with the UTC ship time in each file's header. The two apps carry their own build numbers.

## 2026-11-09

### Course — builds 2026.11.09-1 to -3
- **-3** **Reading a schematic** (six symbols, three rules, tap any wire to see its net, a find-the-net exercise) and **Printed circuit boards**: the same transistor-switch circuit drawn as a schematic and as a board, side by side. Tap a net to light it in both. Toggle top copper, bottom copper, solder mask and silkscreen, or explode the board into its five layers with copper barrels through every plated hole. Current flows as glowing streams along the traces and down through the via. Break it with a cracked trace, a solder bridge or a cold joint, or find a hidden one with a voltage probe. Origin stories for the schematic and for Paul Eisler's printed circuit. NEETS Module 4 now "partly", Module 14 "touched". Glossary +8, one recall question.
- **-2** **Counters & registers** lesson: four toggle flip-flops that count in binary as you pulse them, with the change rippling stage by stage and a live timing diagram showing each stage at half the rate of the one before. Break it with a cut wire or a stuck stage (or a hidden mystery fault) and diagnose it from the numbers that never appear. Register mode loads four bits at once and shifts them left (doubling the number). Origin story: Wynn-Williams's scale-of-two counter (1929–32), built to count alpha particles at the Cavendish, later used at Bletchley Park. NEETS Module 13 row updated; glossary +5; one recall question. Fixed: the Components check said "Six questions" when it had thirteen.
- "Build it for real" for the blinker and logic-gate projects now opens fully wired circuits (the honest-limit note is gone).

### Trainer — build 2026.11.09-1
- **Every live kit project is now wired on the board** and runs on the solver: the NOT, OR, AND, NOR and NAND gates (#24–28) as transistor logic, and the multivibrator (#29), adjustable oscillator (#32) and light-controlled bird (#1) as real two-transistor astables. **Capacitors now charge over time**: the blinker steps forward on screen in real time, and audio oscillators run in fast-forward to measure the pitch you hear. Measured rates match RC theory (blinker within 3% of the swing-corrected formula; oscillator within 8% of 0.69 RC). **Transistor bases now draw current** through a modelled base–emitter junction. Break-it on timed circuits explains what happens over time. Fixed a solver bug: a diode that was on could hold itself on with reverse current, and two parts could flip on and off forever; this made the NAND gate's output depend on what you had pressed before.

Sources for history added this day: Wikipedia (C. E. Wynn-Williams), Computing History (Eryl Wynn-Williams invents the scale-of-two counter), AT&S (Paul Eisler, inventor of the printed circuit board), Eurocircuits (The history of printed circuit boards). These two disagree on when Eisler was formally recognised (1950 vs 1971), so the app says only that it took a long legal fight.

## 2026-11-08

### Course (`electronics-basics.html`) — builds 2026.11.08-1 to -8
- **-8** **Series & parallel** lesson (switchable bench, live current streaks, pull one resistor out to see why Christmas lights fail together and house wiring doesn't) and **Kirchhoff's laws** lesson (a junction table that always balances, and a step-by-step loop walk that always sums to zero), with Kirchhoff's origin story (1845, as a student). Lessons can now hand off to more than one bench project. Three new recall questions; five glossary terms.
- **-7** New **Computing** part: counting and accounts (tallies to khipu), Heron's rope-programmed cart (live simulation, exact geometry), punched cards (Jacquard loom simulation, Babbage, Lovelace, Hollerith), and the bootstrap ladder from ENIAC's plug cables to operating systems, with one tiny program shown at every rung. Recall check, glossary terms, lesson deep links (`#l=<lesson>`). NEETS Module 22 now "touched".
- **-6** "See the flow: gates" — logic gates as liquid through pipes and valves, solved as a real pressure network; switchable between electricity, water and air (fluidics). Answers whether fluid and mechanical machines use the same logic.
- **-5** NEETS coverage tracker for all 24 modules (6 partly covered, 6 touched, 12 not yet).
- **-4** "Why it took so long" (prerequisite map) and "Lost, kept & eureka" lessons; "Build it for real" buttons that open projects on the trainer.
- **-3** Origin story before every component and project: the problem it solved, found or designed, why it's shaped that way, then vs. now.
- **-2** Oscilloscope lesson; live scope traces in the capacitor and blinker lessons. Fixed: capacitor animation wasn't real-time; blinker showed the wrong rate at short periods.
- **-1** Saved progress, recall checks at the end of each part, searchable glossary; phone-layout fixes.

Sources for history added this day: Wikipedia (Breadboard, Multivibrator, Photoresistor), Wikiwand (History of the LED), Computer History Museum (p-n junction, 1940), arXiv 1106.1365 (Bothe and Rossi, coincidence methods), Design World (Vollum and triggering), PS Audio (Rice and Kellogg), History.com (Baghdad battery), Atlas Obscura (Antikythera mechanism), Smithsonian MCI (Zawar zinc), EBSCO (Faraday 1831), PTTLink wiki (NEETS module list), NEETS Module 14 (Internet Archive).

### Trainer (`electronics-trainer.html`) — builds 2026.11.08-1 to -6
- **-6** **Mystery fault** challenge in break-it mode: the bench hides a fault that causes a visible symptom, you probe voltages, then accuse a part; wrong guesses are explained. Fixed: kit project 9 (Parallel Resistors) put the second resistor across the LED, which *dimmed* it; it now sits beside the first resistor and the LED brightens (10.2 → 19.6 mA).
- **-5** **L10 flip-flop** (Eccles and Jordan, 1918): the first build that remembers. The solver now starts each transistor from its last state, which is what lets a two-state circuit hold a bit. **Era 0** card linking to the course's pre-electric computing lessons.
- **-4** X-ray view: hidden metal strips coloured by voltage, and current streaks in every wire and part from a second solve (Kirchhoff-checked). CERN frontier card.
- **-3** Lineage track (9 buildable projects across 7 eras, plus frontier cards); break-it mode with diagnosis; live readings. Fixed: kit project 19 (Night Light) was always on — sensor was on the wrong side of the divider and its model range was unrealistic.
- **-2** Opens a project from a link (`#p=19&from=learn`) with a link back to the course.
- **-1** Origin notes on all 13 live kit projects.

## 2026-06-15
- Course builds -1 to -7 and trainer build -1: first versions.
