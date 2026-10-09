/** Plain-text fallback for saved/model replies; never alter customer input. */
export function formatChatbotText(value: string): string {
  const plainMath = (body: string) => body
    .replace(/\\(?:text|textrm|mathrm|mathbf|operatorname)\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:dfrac|tfrac|frac)\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/\\times\b/g, "×")
    .replace(/\\cdot\b/g, "·")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\(?:leq|le)\b/g, "≤")
    .replace(/\\(?:geq|ge)\b/g, "≥")
    .replace(/\\%/g, "%")
    .replace(/\\[,;:!]/g, " ")
    .trim();

  return value
    .replace(/\r\n/g, "\n")
    .replace(/^[ \t]*```[\w+-]*[ \t]*$/gm, "")
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, body: string) => plainMath(body))
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, body: string) => plainMath(body))
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, body: string) => plainMath(body))
    // A closing dollar followed by digits is another money amount, not math:
    // keep text such as "$5 và $10" intact.
    .replace(/(^|[\s(])\$([^$\n]+)\$(?![\d$])/g,
      (_, prefix: string, body: string) => prefix + plainMath(body))
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[\s(])__([^_]+)__(?=$|[\s).,!?:;])/g, "$1$2")
    .replace(/(^|[\s(])([*_])([^\s*_](?:[^*_\n]*?[^\s*_])?)\2(?=$|[\s).,!?:;])/g, "$1$3")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm, "$1")
    .replace(/^([ \t]*)[-*+][ \t]+/gm, "$1• ")
    .replace(/^[ \t]*>[ \t]?/gm, "")
    .replace(/!?\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) =>
      label === url ? url : `${label} (${url})`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
