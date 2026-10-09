import { useEffect, useMemo, useRef, useState } from "react";

// This is a presentation effect over a completed response, not a second request.
export function useChatbotReveal(text: string, cardCount: number, animate: boolean, onComplete?: () => void) {
  const characters = useMemo(() => Array.from(text), [text]);
  const [progress, setProgress] = useState({ text: 0, cards: 0 });
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    if (!animate) return;
    setProgress({ text: 0, cards: 0 });
    let visibleText = 0;
    let visibleCards = 0;
    let cardTicks = 0;
    let stopped = false;
    // Small chunks at 30fps; even a very long answer finishes within 12s.
    const chunk = Math.max(3, Math.ceil(characters.length / 360));
    const timer = setInterval(() => {
      if (stopped) return;
      if (visibleText < characters.length) {
        visibleText = Math.min(characters.length, visibleText + chunk);
      } else if (visibleCards < cardCount) {
        if (++cardTicks < 5) return;
        cardTicks = 0;
        visibleCards += 1;
      } else {
        stopped = true;
        clearInterval(timer);
        complete.current?.();
        return;
      }
      setProgress({ text: visibleText, cards: visibleCards });
    }, 33);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [animate, characters, cardCount]);

  return {
    text: animate ? characters.slice(0, progress.text).join("") : text,
    cardCount: animate ? progress.cards : cardCount,
  };
}
