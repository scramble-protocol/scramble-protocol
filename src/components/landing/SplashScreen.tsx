import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils.js';
import { PixelEmoji } from '../common/PixelEmoji.js';
import { useAudio } from '../../contexts/AudioContext.js';

/* ---- Typewriter text lines ---- */

const LINES: readonly string[] = [
  '> SCRAMBLE PROTOCOL v1.0',
  '> DeFi yield on Bitcoin L1',
  '',
  '> Three yield engines loaded...',
  '  - The Spatula ... OK',
  '  - Yoke Tax ... OK',
  '  - $EGG Emissions ... OK',
  '',
  '> The Pan is hot.',
  '',
] as const;

const PROMPT_LINE = '> PRESS ENTER TO START COOKING';

/* ---- Component ---- */

function SplashScreen({ onDismiss }: { readonly onDismiss: () => void }): React.ReactElement {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState<{ line: number; char: number }>({ line: 0, char: 0 });
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const { startMusic } = useAudio();

  const showPrompt = cursor.line >= LINES.length;

  /* Typewriter effect — all setState calls inside setTimeout callbacks */
  useEffect((): (() => void) => {
    if (cursor.line >= LINES.length) {
      return (): void => { /* noop */ };
    }

    const line = LINES[cursor.line];

    if (line === '') {
      const timer = setTimeout((): void => {
        setDisplayedLines((prev: string[]): string[] => [...prev, '']);
        setCursor({ line: cursor.line + 1, char: 0 });
      }, 35);
      return (): void => { clearTimeout(timer); };
    }

    if (cursor.char >= line.length) {
      const timer = setTimeout((): void => {
        setDisplayedLines((prev: string[]): string[] => [...prev, line]);
        setCursor({ line: cursor.line + 1, char: 0 });
      }, 35);
      return (): void => { clearTimeout(timer); };
    }

    const speed = line[cursor.char] === '.' ? 120 : 35;
    const timer = setTimeout((): void => {
      setCursor({ line: cursor.line, char: cursor.char + 1 });
    }, speed);

    return (): void => { clearTimeout(timer); };
  }, [cursor]);

  /* Handle Enter key */
  useEffect((): (() => void) => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Enter') {
        dismiss();
      }
    }

    function dismiss(): void {
      setFadeOut(true);
      setTimeout((): void => {
        onDismiss();
      }, 500);
    }

    window.addEventListener('keydown', handleKeyDown);
    return (): void => { window.removeEventListener('keydown', handleKeyDown); };
  }, [onDismiss]);

  /* Build the currently-typing partial line */
  const partialLine = cursor.line < LINES.length
    ? LINES[cursor.line].slice(0, cursor.char)
    : '';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500',
        fadeOut ? 'opacity-0' : 'opacity-100',
      )}
      onClick={(): void => {
        startMusic();
        if (showPrompt) {
          setFadeOut(true);
          setTimeout((): void => {
            onDismiss();
          }, 500);
        }
      }}
      role="presentation"
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-xl flex-col gap-4 px-6">
        {/* Egg icon */}
        <div className="flex justify-center mb-4">
          <PixelEmoji emoji="🍳" size={64} pixelSize={4} />
        </div>

        {/* Terminal-style output */}
        <div className="font-retro text-[10px] leading-relaxed text-primary sm:text-xs">
          {displayedLines.map((line: string, idx: number): React.ReactElement => (
            <p key={`${String(idx)}`} className={cn('min-h-[1.5em]', line === '' && 'min-h-[0.75em]')}>
              {line}
            </p>
          ))}

          {/* Currently typing line */}
          {cursor.line < LINES.length && (
            <p className="min-h-[1.5em]">
              {partialLine}
              <span className="animate-pulse">_</span>
            </p>
          )}

          {/* Press Enter prompt */}
          {showPrompt && (
            <>
              <p className="mt-6 animate-pulse text-center text-egg hidden sm:block">
                {PROMPT_LINE}
              </p>
              <p className="mt-6 animate-pulse text-center text-egg sm:hidden">
                {'> TAP TO START COOKING'}
              </p>
            </>
          )}
        </div>

        {/* Click hint for mobile / audio start */}
        <p className="mt-8 text-center text-[8px] text-muted-foreground font-retro animate-pulse">
          CLICK FOR SOUND
        </p>
      </div>
    </div>
  );
}

export { SplashScreen };
