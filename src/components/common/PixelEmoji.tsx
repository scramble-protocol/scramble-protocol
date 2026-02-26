import React, { useMemo } from 'react';

interface PixelEmojiProps {
  readonly emoji: string;
  readonly size?: number;
  readonly pixelSize?: number;
  readonly className?: string;
}

const cache = new Map<string, string>();

function renderPixelEmoji(emoji: string, outputSize: number, pixelSize: number): string {
  const key = `${emoji}-${String(outputSize)}-${String(pixelSize)}`;
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  if (typeof document === 'undefined') {
    return '';
  }

  const gridSize = Math.ceil(outputSize / pixelSize);

  const small = document.createElement('canvas');
  small.width = gridSize;
  small.height = gridSize;
  const sCtx = small.getContext('2d');
  if (sCtx === null) {
    return '';
  }

  sCtx.font = `${String(gridSize * 0.85)}px serif`;
  sCtx.textAlign = 'center';
  sCtx.textBaseline = 'middle';
  sCtx.fillText(emoji, gridSize / 2, gridSize / 2);

  const big = document.createElement('canvas');
  big.width = outputSize;
  big.height = outputSize;
  const bCtx = big.getContext('2d');
  if (bCtx === null) {
    return '';
  }

  bCtx.imageSmoothingEnabled = false;
  bCtx.drawImage(small, 0, 0, outputSize, outputSize);

  const dataUrl = big.toDataURL();
  cache.set(key, dataUrl);
  return dataUrl;
}

function PixelEmoji({ emoji, size = 48, pixelSize = 3, className }: PixelEmojiProps): React.ReactElement {
  const src = useMemo(
    (): string => renderPixelEmoji(emoji, size, pixelSize),
    [emoji, size, pixelSize],
  );

  if (src === '') {
    return (
      <span className={className} style={{ display: 'inline-block', width: size, height: size }} aria-hidden="true">
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

export { PixelEmoji };
