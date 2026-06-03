import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { toLatex } from "@/lib/formulaToLatex";

interface Props {
  formula: string;
  display?: boolean;
  className?: string;
}

export function MathRenderer({ formula, display = false, className }: Props) {
  const html = useMemo(() => {
    const latex = toLatex(formula);
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "html",
      });
    } catch {
      return `<span class="font-mono">${formula
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
    }
  }, [formula, display]);

  return (
    <span
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}