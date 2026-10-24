import type { HelpSection } from "../types/chatbot";

export function guidePosition(sections: HelpSection[], sectionId?: string, stepParam?: string) {
  const section = sectionId ? sections.find(item => item.id === sectionId) : undefined;
  const count = section?.steps?.length ?? 1;
  const number = Number(stepParam ?? 1);
  return { section, invalid: !!sectionId && !section, step: Number.isInteger(number) && number >= 1 && number <= count ? number - 1 : 0 };
}
