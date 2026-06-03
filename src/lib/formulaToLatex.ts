// Convert unicode-formatted formula strings to KaTeX-friendly LaTeX.
// Best-effort: preserves all original information. KaTeX is invoked with
// strict:false / throwOnError:false so anything we miss still renders.

const SUPER: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+",
  "ⁿ": "n", "ⁱ": "i",
};
const SUB: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "ₙ": "n", "ᵢ": "i",
  "ₐ": "a", "ₑ": "e", "ₒ": "o", "ₓ": "x", "ₕ": "h", "ₖ": "k",
  "ₗ": "l", "ₘ": "m", "ₚ": "p", "ₛ": "s", "ₜ": "t",
};
const FRAC: Record<string, string> = {
  "½": "\\tfrac{1}{2}", "⅓": "\\tfrac{1}{3}", "⅔": "\\tfrac{2}{3}",
  "¼": "\\tfrac{1}{4}", "¾": "\\tfrac{3}{4}", "⅕": "\\tfrac{1}{5}",
  "⅛": "\\tfrac{1}{8}",
};
const SYM: Record<string, string> = {
  "×": "\\times ", "÷": "\\div ", "·": "\\cdot ",
  "−": "-", "–": "-", "—": "-",
  "≈": "\\approx ", "≠": "\\neq ", "≤": "\\le ", "≥": "\\ge ",
  "∝": "\\propto ", "∞": "\\infty ", "°": "^{\\circ}",
  "∑": "\\sum ", "∏": "\\prod ", "∫": "\\int ", "∮": "\\oint ",
  "∂": "\\partial ", "∇": "\\nabla ", "√": "\\sqrt{}",
  "→": "\\to ", "⇌": "\\rightleftharpoons ", "⇒": "\\Rightarrow ",
  "⟶": "\\longrightarrow ", "↔": "\\leftrightarrow ",
  "Δ": "\\Delta ", "Σ": "\\Sigma ", "Π": "\\Pi ", "Ω": "\\Omega ",
  "Γ": "\\Gamma ", "Λ": "\\Lambda ", "Φ": "\\Phi ", "Ψ": "\\Psi ",
  "Θ": "\\Theta ", "Ξ": "\\Xi ",
  "α": "\\alpha ", "β": "\\beta ", "γ": "\\gamma ", "δ": "\\delta ",
  "ε": "\\varepsilon ", "ζ": "\\zeta ", "η": "\\eta ", "θ": "\\theta ",
  "ι": "\\iota ", "κ": "\\kappa ", "λ": "\\lambda ", "μ": "\\mu ",
  "ν": "\\nu ", "ξ": "\\xi ", "π": "\\pi ", "ρ": "\\rho ",
  "σ": "\\sigma ", "τ": "\\tau ", "υ": "\\upsilon ", "φ": "\\varphi ",
  "χ": "\\chi ", "ψ": "\\psi ", "ω": "\\omega ",
  "ℏ": "\\hbar ", "ℵ": "\\aleph ", "∈": "\\in ", "∉": "\\notin ",
  "⊂": "\\subset ", "⊆": "\\subseteq ", "∪": "\\cup ", "∩": "\\cap ",
  "∅": "\\emptyset ", "∀": "\\forall ", "∃": "\\exists ",
  "·": "\\cdot ",
};

function escapeLatex(ch: string): string {
  switch (ch) {
    case "%": return "\\%";
    case "&": return "\\&";
    case "#": return "\\#";
    case "$": return "\\$";
    case "{": return "\\{";
    case "}": return "\\}";
    case "_": return "\\_";
    default: return ch;
  }
}

export function toLatex(input: string): string {
  if (!input) return "";
  const chars = [...input];
  let out = "";
  let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    // run of superscripts
    if (SUPER[c]) {
      let run = "";
      while (i < chars.length && SUPER[chars[i]]) { run += SUPER[chars[i]]; i++; }
      out += `^{${run}}`;
      continue;
    }
    if (SUB[c]) {
      let run = "";
      while (i < chars.length && SUB[chars[i]]) { run += SUB[chars[i]]; i++; }
      out += `_{${run}}`;
      continue;
    }
    if (FRAC[c]) { out += FRAC[c] + " "; i++; continue; }
    if (SYM[c]) { out += SYM[c]; i++; continue; }
    // ASCII letters / digits / operators pass through
    if (/[A-Za-z0-9]/.test(c)) {
      // variable-like: identifier chars + plain underscores via _{xx} for tokens like "S_n"
      // handle pattern X_word (ASCII) - convert to X_{word}
      out += c;
      i++;
      // peek for "_<word>" ASCII subscript
      if (chars[i] === "_") {
        let j = i + 1;
        let sub = "";
        while (j < chars.length && /[A-Za-z0-9]/.test(chars[j])) { sub += chars[j]; j++; }
        if (sub) { out += `_{${sub}}`; i = j; continue; }
      }
      continue;
    }
    if (c === "^") {
      // ASCII caret: capture next token
      i++;
      let j = i;
      let sup = "";
      if (chars[j] === "(") {
        // find matching )
        let depth = 1; j++;
        while (j < chars.length && depth > 0) {
          if (chars[j] === "(") depth++;
          else if (chars[j] === ")") depth--;
          if (depth > 0) sup += chars[j];
          j++;
        }
      } else {
        while (j < chars.length && /[A-Za-z0-9\-+]/.test(chars[j])) { sup += chars[j]; j++; }
      }
      out += `^{${sup}}`;
      i = j;
      continue;
    }
    // whitespace and operators pass through
    if (/[\s+\-*/=().,;:|<>?!\[\]]/.test(c)) { out += c; i++; continue; }
    // anything else: try to escape; if it's a remaining unicode, leave as-is (KaTeX strict:false)
    out += escapeLatex(c);
    i++;
  }
  return out;
}