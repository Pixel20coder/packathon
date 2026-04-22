# 🌿 EcoSachet — Biodegradable Multi-Layer Packaging

<p align="center">
  <strong>Packaging That Returns to Earth</strong><br>
  A biodegradable, plastic-free sachet packaging solution replacing conventional non-recyclable plastic laminates.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Decomposition-60--120%20Days-6BCB77?style=for-the-badge" alt="Decomposition">
  <img src="https://img.shields.io/badge/Plastic%20Free-100%25-4ECDC4?style=for-the-badge" alt="Plastic Free">
  <img src="https://img.shields.io/badge/Cost-₹0.45%20Per%20Sachet-FFD93D?style=for-the-badge&logoColor=black" alt="Cost">
</p>

---

## 🚀 Overview

**EcoSachet** is a multi-layer bio-composite sachet engineered to replace the billions of non-biodegradable plastic sachets generated annually by the pan masala and gutkha industries. Our three-layer architecture delivers moisture resistance, structural durability, food safety, and complete environmental degradation — all while being compatible with existing FFS (Form-Fill-Seal) packaging machines.

## 🎯 The Problem

- **100+ years** — time for a single plastic sachet to decompose
- **Non-recyclable** — multi-layer plastic laminates can't be recycled with current technology
- **#1 plastic waste** — sachets are the top category of plastic litter in urban areas
- **Zero viable alternatives** — until now

## 💡 Our Solution — Three-Layer Bio-Composite

| Layer | Material | Function |
|-------|----------|----------|
| **Outer** | Kraft Paper / Bamboo Fiber | Structural strength, printability, branding |
| **Barrier** | PLA / PHA / Shellac Bio-Coating | Moisture & oxygen resistance |
| **Inner** | Starch-Based Biopolymer Film | Food-safe, heat-sealable, compostable |

## ✨ Key Features

- 🕐 **60–120 Day Decomposition** — zero microplastic residue
- 💧 **Moisture Resistant** — 3–6 month shelf life
- 🔥 **Heat Sealable** — compatible with existing FFS machines
- ⚡ **High-Speed Compatible** — no workflow changes required
- 🍽️ **Food Safe** — meets food-grade safety standards
- ✂️ **Easy Tear Design** — identical usability to plastic sachets

## 🖥️ Live Demo Features

This interactive showcase website includes:

- **3D Product Visualization** — interactive Three.js-powered 3D sachet model with orbit controls
- **Exploded Layer View** — scroll-triggered 3D layer breakdown showing the bio-composite architecture
- **Degradation Simulator** — drag-to-simulate 120-day decomposition with real-time 3D shader effects (dissolve, color shift, sprouting)
- **Scroll Animations** — GSAP-powered scroll-triggered animations throughout
- **Responsive Design** — fully responsive with static image fallbacks on mobile

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe source code (strict mode) |
| **HTML5 / CSS3** | Structure & styling |
| **Three.js** | 3D product visualization & degradation simulation |
| **GSAP + ScrollTrigger** | Scroll-based animations |
| **Google Fonts (Outfit + Inter)** | Typography |

## 📁 Project Structure

```
packathon/
├── index.html          # Main HTML page
├── styles.css          # All styles & responsive design
├── tsconfig.json       # TypeScript configuration (strict mode)
├── package.json        # Dependencies & build scripts
├── src/
│   ├── script.ts       # Core TS — animations, particles, counters
│   └── app3d.ts        # Three.js TS — 3D sachet, layers, degradation
├── dist/               # Compiled JavaScript output (git-ignored)
└── assets/
    ├── hero.png          # Hero section fallback image
    ├── layers.png        # Layer cross-section fallback
    ├── problem.png       # Problem section image
    └── decomposition.png # Decomposition cycle image
```

## 🚀 Getting Started

Simply open `index.html` in a modern browser:

```bash
# Clone the repository
git clone https://github.com/Pixel20coder/packathon.git
cd packathon

# Install dependencies
npm install

# Build TypeScript
npm run build

# Open in browser
open index.html
```

> **Note:** For the best 3D experience, use a WebGL-capable desktop browser (Chrome, Firefox, Edge). Mobile devices will display static image fallbacks.

## 📊 Impact Metrics

| Metric | Value |
|--------|-------|
| Microplastic Residue | **0%** |
| Carbon Footprint Reduction | **85%** |
| Landfill Waste Reduction | **95%** |

## 🗺️ Roadmap

| Phase | Timeline | Goal |
|-------|----------|------|
| **Phase 1** | Current | Prototype validation & testing |
| **Phase 2** | Q3 2026 | Pilot manufacturing & certifications |
| **Phase 3** | 2027 | Industrial-scale rollout |
| **Phase 4** | 2028+ | FMCG expansion & smart packaging |

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built for a sustainable future 🌍</strong><br>
  <em>EcoSachet — Because packaging shouldn't outlive us.</em>
</p>
