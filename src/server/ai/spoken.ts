export function naturalizeMentorAnswer(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/^#{1,6}[ \t]+/gm, "")
    .replace(/^[ \t]*[-*•][ \t]+/gm, "")
    .replace(/^[ \t]*\d+[.)][ \t]+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
