# 🥁 Drum Machine

**[▶ Live Demo](https://johnernstdev.github.io/DrumMachine/)**

A browser-based drum machine built with TypeScript and the Web Audio API.

## Instruments

All sounds are fully synthesized — no samples required.

| Pad | Key | Sound |
|-----|-----|-------|
| Bass Drum | `Q` | Sine oscillator with pitch drop + click transient |
| Snare | `W` | Filtered noise + sine body |
| Clap | `E` | Multiple noise bursts with offset timing |
| Hi-Hat (Closed) | `R` | Short high-passed noise burst |
| Hi-Hat (Open) | `T` | Longer high-passed noise |
| High Tom | `A` | Sine with pitch envelope |
| Mid Tom | `S` | Sine with pitch envelope |
| Low Tom | `D` | Sine with pitch envelope |
| Crash | `Z` | Filtered noise, long decay |
| Ride | `X` | Filtered noise + bell ping tone |

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── main.ts              # Entry point — UI wiring & keyboard shortcuts
├── DrumKit.ts           # Orchestrates all instruments via shared AudioContext
├── types.ts             # InstrumentName type
├── style.css
├── utils/
│   └── noise.ts         # White noise buffer helper
└── instruments/
    ├── BassDrum.ts
    ├── Snare.ts
    ├── HiHat.ts
    ├── Tom.ts
    ├── Clap.ts
    └── Cymbal.ts
```
