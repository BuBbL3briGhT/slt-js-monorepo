
# SLT-JS — Semantic Linguistic Transpiler for JavaScript ✨

SLT-JS is an experimental, community-driven system that converts
**natural-language programming statements** into **real JavaScript**.

It supports multiple languages using “Language Packs”, and integrates with:

- **SLT-Core** — core parser, semantic engine, resolver, and JS generator
- **Babel / SWC plugins** for build tool integration
- **Acorn plugin** for lightweight AST access
- **CLI tools** (`slt build`, `slt run`, `slt check`, etc.)
- **Web Demo** so users can try SLT in the browser
- **Editor Support** like SLT syntax for Vim

The vision is to create a **unified framework** for
“linguistically-driven programming”.

---

## 📦 Packages

packages/ slt-js-core/ slt-cli/ slt-babel-plugin/ slt-acorn-plugin/ slt-web-demo/ slt-syntax-vim/ @slt-lang/ es/ fr/ it/ pt/ de/ hi/ ar/ zu/ sw/ ru/ ja/

---

## 🔧 Developer Setup

```bash
pnpm install
pnpm build
pnpm test


---

🚀 Web Demo

Open:

packages/slt-web-demo/index.html

And you can try SLT-JS in your browser immediately.


---

🤝 Contributing

See CONTRIBUTING.md

We welcome:

Language Packs

Grammar improvements

Transpiler features

IDE integrations

Documentation fixes



---

🌍 Supported languages

Out of the box:

Language	Code	Status

English	en	core
Spanish	es	complete
French	fr	complete
Italian	it	complete
German	de	complete
Portuguese	pt	complete
Arabic (MSA)	ar	partial
Hindi	hi	partial
Russian	ru	partial
Swahili	sw	partial
Zulu	zu	partial
Japanese	ja	partial



---

🧪 Testing

pnpm test

All packages include their own unit tests.


---

📄 License

MIT — free for commercial and open-source use.


---

❤️ Vision

SLT-JS is intended to be human-friendly, multilingual, and community powered.

Our goal is to help people create JavaScript using the syntax of their own language and culture, opening new ways of thinking about programming.

"cuando el contador llegue a 10, mostrar '¡Listo!'"
→ becomes valid JS

Let’s build this together. 🌱

---

# **`CONTRIBUTING.md`**
```markdown
# Contributing to SLT-JS

Thank you for your interest in improving SLT-JS!
This project is intended to be open, multilingual, and community-driven.

---

## 💡 Ways to Contribute

### 1. Language Packs
Each language lives under:

packages/@slt-lang/xx/

A language pack defines:

- token patterns
- grammar rules
- intent → JavaScript mappings
- semantic resolution helpers

---

### 2. Core Improvements

Areas to refine:

- NLP pattern recognition
- rule priorities & weighting
- JS generator templates
- error messaging
- idiom-based transformations

---

### 3. Tooling
Contribute integrations for:

- editor plugins
- browser extensions
- IDE syntax highlighting
- Babel/SWC/Rollup/Vite
- online playgrounds

---

## 🧪 Tests

Every package includes its own tests.

Run all tests:

```bash
pnpm test


---

📦 Build

pnpm build


---

🧹 Formatting / Linting

pnpm format
pnpm lint

Prettier + ESLint ensure consistent formatting.


---

🔀 Pull Requests

Please include:

A clear explanation of the change

Tests for new behavior

Documentation changes if needed


We love all contributions — languages, features, examples, ideas.


---

❤️ Community

SLT-JS exists to make programming more expressive, inclusive, and fun.

Thank you for helping make it real.

