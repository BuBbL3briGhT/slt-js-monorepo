import * as acorn from "https://cdn.skypack.dev/acorn";
import * as babel from "https://cdn.skypack.dev/@babel/standalone";
import { createHighlighter } from "./highlight.js";

const languageSelect = document.getElementById("languageSelect");
const modeToggle = document.getElementById("modeToggle");
const runBtn = document.getElementById("runBtn");

let inputEditor, outputEditor;
let languagePacks = {};
let activeMap = {};

async function loadLanguagePacks() {
  // List languages shipped in the monorepo
  const langs = [
    "es", "fr", "it", "pt", "de",
    "hi", "ar", "zu", "sw", "ru", "ja"
  ];

  for (const iso of langs) {
    const mod = await fetch(`../@slt-lang/${iso}/index.json`)
      .then(r => r.json());
    languagePacks[iso] = mod;
  }

  // Populate menu
  Object.entries(languagePacks).forEach(([iso, pack]) => {
    const opt = document.createElement("option");
    opt.value = iso;
    opt.textContent = `${pack.language} (${iso})`;
    languageSelect.appendChild(opt);
  });

  // Default
  languageSelect.value = "es";
  activeMap = languagePacks["es"].map;
}

function initEditors() {
  inputEditor = CodeMirror.fromTextArea(
    document.getElementById("input"),
    { mode: "javascript", lineNumbers: true }
  );

  outputEditor = CodeMirror.fromTextArea(
    document.getElementById("output"),
    { mode: "javascript", lineNumbers: true, readOnly: true }
  );
}

function buildReverseMap(map) {
  const rev = {};
  for (const [k, v] of Object.entries(map)) rev[v] = k;
  return rev;
}

function convert(source, map, direction) {
  // direction = "to-js" or "from-js"
  const useMap = direction === "to-js" ? map : buildReverseMap(map);

  // Escape regex safely
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const [from, to] of Object.entries(useMap)) {
    const pattern = new RegExp(`\\b${esc(from)}\\b`, "g");
    source = source.replace(pattern, to);
  }
  return source;
}

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

function runTranspile() {
  const src = inputEditor.getValue();
  const direction = modeToggle.value;

  // Apply keyword map
  const mapped = convert(src, activeMap, direction);

  // Debug output
  try {
    const ast = acorn.parse(mapped, { ecmaVersion: "latest" });
    document.getElementById("astOutput").textContent = pretty(ast);

    const babelOut = babel.transform(mapped, {
      presets: ["env"]
    }).code;

    document.getElementById("babelOut").textContent = babelOut;
    document.getElementById("normAstOutput").textContent = pretty(ast);

    outputEditor.setValue(babelOut);

  } catch (err) {
    outputEditor.setValue("Error: " + err.message);
  }
}

languageSelect.addEventListener("change", () => {
  activeMap = languagePacks[languageSelect.value].map;
  createHighlighter(inputEditor, Object.keys(activeMap));
});

runBtn.addEventListener("click", runTranspile);

// Init
await loadLanguagePacks();
initEditors();
createHighlighter(inputEditor, Object.keys(activeMap));
