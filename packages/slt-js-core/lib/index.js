const fs = require('fs');
// Simple core transpiler (uses a mapping table provided via maps directory or built-in)
// This is a reference implementation; in production use a proper parser/tokenizer.

const builtInMaps = {
  "es": {
    "función": "function", "funcion":"function", "vuelta":"return","mientras":"while","si":"if","sino":"else","constante":"const","deja":"let","para":"for","romper":"break","continuar":"continue","intentar":"try","capturar":"catch","finalmente":"finally","clase":"class","nuevo":"new","importar":"import","desde":"from","como":"as","exportar":"export","nulo":"null","verdadero":"true","falso":"false"
  },
  "fr": {
    "fonction":"function","retour":"return","tantque":"while","si":"if","sinon":"else","constante":"const","laisse":"let","pour":"for","break":"break","continuer":"continue","essayer":"try","attraper":"catch","finalement":"finally","classe":"class","nouveau":"new","importer":"import","de":"from","comme":"as","exporter":"export","nul":"null","vrai":"true","faux":"false"
  },
  "it": {
    "funzione":"function","ritorna":"return","mentre":"while","se":"if","altrimenti":"else","costante":"const","lascia":"let","per":"for","interrompi":"break","continua":"continue","prova":"try","cattura":"catch","finalmente":"finally","classe":"class","nuovo":"new","importa":"import","da":"from","come":"as","esporta":"export","nullo":"null","vero":"true","falso":"false"
  },
  "zu": {
    "buyisela":"return","umsebenzi":"function","uma":"if","kungenjalo":"else","noma":"while","kwi":"for"
  }
};

function parseSltLine(firstLine) {
  const m = firstLine.trim().match(/^#!slt\s+([A-Za-z0-9\-]+)(?:\s*;(.*))?$/);
  if (!m) return null;
  return { lang: m[1], options: m[2] ? m[2].split(';').map(s=>s.trim()).filter(Boolean):[] };
}

function computeSkipRanges(src) {
  const ranges=[]; const N=src.length; let i=0;
  while(i<N){ const ch=src[i];
    if (ch==='/' && src[i+1]==='/'){ const start=i; i+=2; while(i<N && src[i]!=='\n') i++; ranges.push([start,i]); continue; }
    if (ch==='/' && src[i+1]==='*'){ const start=i; i+=2; while(i<N && !(src[i]==='*' && src[i+1]==='/')) i++; i+=2; ranges.push([start,i]); continue; }
    if (ch==="'"||ch==='"'){ const q=ch; const start=i; i++; while(i<N){ if (src[i]==='\\'){ i+=2; continue;} if (src[i]===q){ i++; break;} i++; } ranges.push([start,i]); continue; }
    if (ch==='`'){ const start=i; i++; while(i<N){ if (src[i]==='\\'){ i+=2; continue;} if (src[i]==='`'){ i++; break;} if (src[i]==='$' && src[i+1]==='{'){ i+=2; let depth=1; while(i<N && depth>0){ if (src[i]==='"'||src[i]==="'\"\"'){ const q=src[i++]; while(i<N){ if (src[i]==='\\'){ i+=2; continue;} if (src[i]===q){ i++; break;} i++; } continue; } if (src[i]==='{'){ depth++; i++; continue;} if (src[i]==='}'){ depth--; i++; continue;} i++; } continue;} i++; } ranges.push([start,i]); continue; }
    i++;
  }
  return ranges;
}

function escapeForRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

function replaceOutsideRanges(src, ranges, mapping){
  const keys = Object.keys(mapping).map(k=>escapeForRegex(k)).sort((a,b)=>b.length-a.length);
  if (keys.length===0) return src;
  const re = new RegExp("\\b("+keys.join("|")+")\\b","gu");
  let out=''; let pos=0; let rIndex=0;
  function nextRange(){ return rIndex<ranges.length?ranges[rIndex]:null; }
  while(pos<src.length){
    const r = nextRange();
    if (r && pos>=r[1]){ rIndex++; continue; }
    if (r && pos<r[0]){
      const chunk = src.slice(pos, r[0]);
      out += chunk.replace(re, m => mapping[m] || mapping[m.toLowerCase()] || m);
      pos = r[0]; continue;
    }
    if (!r){ const chunk = src.slice(pos); out += chunk.replace(re, m => mapping[m] || mapping[m.toLowerCase()] || m); break; }
    out += src.slice(r[0], r[1]); pos = r[1]; rIndex++;
  }
  return out;
}

function loadMapForLang(lang) {
  if (builtInMaps[lang]) return builtInMaps[lang];
  const base = lang.split('-')[0];
  if (builtInMaps[base]) return builtInMaps[base];
  return null;
}

function transpileFileContent(src, filename) {
  const firstLine = src.split(/\r?\n/,1)[0] || '';
  const slt = parseSltLine(firstLine);
  if (!slt) return src;
  const mapping = loadMapForLang(slt.lang);
  if (!mapping) return src;
  const ranges = computeSkipRanges(src);
  return replaceOutsideRanges(src, ranges, mapping);
}

module.exports = { transpileFileContent };
