import React from 'react';
import { cn } from '@/lib/utils.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/8bit/card.js';

interface CookLevel {
  readonly level: number;
  readonly name: string;
  readonly multiplier: string;
  readonly blocks: string;
  readonly glow: boolean;
}

const LEVELS: readonly CookLevel[] = [
  { level: 1, name: 'Raw Egg', multiplier: '1.00x', blocks: '0\u20131,008 (~0\u20137 days)', glow: false },
  { level: 2, name: 'Soft Boiled', multiplier: '1.25x', blocks: '1,008\u20134,320 (~7\u201330 days)', glow: false },
  { level: 3, name: 'Over Easy', multiplier: '1.50x', blocks: '4,320\u201312,960 (~30\u201390 days)', glow: false },
  { level: 4, name: 'Fully Scrambled', multiplier: '2.00x', blocks: '12,960+ (~90+ days)', glow: true },
] as const;

function CookLevels(): React.ReactElement {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-retro text-sm text-center text-primary mb-10">
          Cook Levels &mdash; The Longer, The Better
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((lv: CookLevel): React.ReactElement => (
            <Card
              key={lv.name}
              className={cn(
                lv.glow && 'border-egg/50 bg-egg/5 shadow-[0_0_20px_rgba(234,179,8,0.15)]',
              )}
            >
              <CardHeader className="items-center text-center p-3">
                <CardDescription className="text-[10px]">
                  Level {String(lv.level)}
                </CardDescription>
                <CardTitle className="text-xs">{lv.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-1 p-3 pt-0">
                <p className="text-lg font-bold text-primary">{lv.multiplier}</p>
                <p className="text-[10px] text-muted-foreground">{lv.blocks}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Withdrawing resets Cook Level. $EGG boost adds +0.25x. Week 1 bonus
          adds 3x on top.
        </p>
      </div>
    </section>
  );
}

export { CookLevels };
