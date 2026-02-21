import { useEffect, useRef, useCallback } from 'react';

/**
 * Parallax + fade-out on the hero section, driven by scroll position.
 * Returns a ref to attach to the hero wrapper element.
 */
function useHeroParallax(): React.RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null);

  const handleScroll = useCallback((): void => {
    const el = ref.current;
    if (el === null) return;

    const scrollY = window.scrollY;
    const heroH = el.offsetHeight;

    // Only do work while hero is in view
    if (scrollY > heroH) return;

    const ratio = scrollY / heroH; // 0 → 1

    // Parallax: background moves at 40% of scroll speed
    el.style.backgroundPositionY = `${scrollY * 0.4}px`;

    // Content fades out and drifts up
    const content = el.querySelector<HTMLElement>('.hero__content');
    if (content !== null) {
      content.style.opacity = String(1 - ratio * 1.2);
      content.style.transform = `translateY(${scrollY * -0.25}px)`;
    }

    // Glow shrinks as you scroll
    const glow = el.querySelector<HTMLElement>('.hero__glow');
    if (glow !== null) {
      glow.style.opacity = String(Math.max(0, 0.5 - ratio));
    }
  }, []);

  useEffect((): (() => void) => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return (): void => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return ref;
}

/**
 * Intersection Observer that adds `.scroll-reveal--visible` to elements
 * with `.scroll-reveal` when they enter the viewport.
 * Call once at the page level — observes all matching elements.
 */
function useScrollReveal(containerRef: React.RefObject<HTMLElement | null>): void {
  useEffect((): (() => void) => {
    const container = containerRef.current;
    if (container === null) return (): void => {};

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('scroll-reveal--visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    const targets = container.querySelectorAll<HTMLElement>('.scroll-reveal');
    targets.forEach((el: HTMLElement): void => {
      observer.observe(el);
    });

    return (): void => {
      observer.disconnect();
    };
  }, [containerRef]);
}

export { useHeroParallax, useScrollReveal };
