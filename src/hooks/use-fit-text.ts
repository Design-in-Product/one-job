// src/hooks/use-fit-text.ts
// Sizes a block of text to fill its container: binary-searches the largest
// font size (in px, applied to the content wrapper — children scale with em)
// at which the content still fits the container's box. Re-measures when the
// container resizes or the deps change.

import { useLayoutEffect, useRef, useState } from 'react';

interface FitTextOptions {
  /** Smallest font size to settle for, px */
  min?: number;
  /** Largest font size to try, px */
  max?: number;
}

export function useFitText(
  deps: React.DependencyList,
  { min = 15, max = 96 }: FitTextOptions = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(min);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const fits = (size: number) => {
        content.style.fontSize = `${size}px`;
        return (
          content.scrollHeight <= container.clientHeight &&
          // +1 tolerates sub-pixel rounding; overflowing words (not wrapping)
          // are what push scrollWidth past the box
          content.scrollWidth <= container.clientWidth + 1
        );
      };

      let lo = min;
      let hi = max;
      // largest size that fits, to the nearest px
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (fits(mid)) lo = mid;
        else hi = mid - 1;
      }
      content.style.fontSize = `${lo}px`;
      setFontSize(lo);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, contentRef, fontSize };
}
