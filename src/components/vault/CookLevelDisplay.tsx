import type { ReactElement } from 'react';
import { ProgressBar } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/cook-level-display.css';

interface CookLevelDisplayProps {
  readonly cookLevel: number;
  readonly depositBlock: bigint;
  readonly currentBlock: bigint;
}

interface LevelInfo {
  readonly name: string;
  readonly multiplier: string;
  readonly threshold: number;
}

const LEVELS: readonly LevelInfo[] = [
  { name: 'Raw Egg', multiplier: '1.00x', threshold: 0 },
  { name: 'Soft Boiled', multiplier: '1.25x', threshold: 1008 },
  { name: 'Over Easy', multiplier: '1.50x', threshold: 4320 },
  { name: 'Fully Scrambled', multiplier: '2.00x', threshold: 12960 },
];

function getNextThreshold(level: number): number {
  if (level >= LEVELS.length - 1) {
    return LEVELS[LEVELS.length - 1]?.threshold ?? 12960;
  }
  return LEVELS[level + 1]?.threshold ?? 12960;
}

function getCurrentThreshold(level: number): number {
  const clampedLevel = Math.min(Math.max(level, 0), LEVELS.length - 1);
  return LEVELS[clampedLevel]?.threshold ?? 0;
}

function CookLevelDisplay({
  cookLevel,
  depositBlock,
  currentBlock,
}: CookLevelDisplayProps): ReactElement {
  const clampedLevel = Math.min(Math.max(cookLevel, 0), LEVELS.length - 1);
  const currentInfo = LEVELS[clampedLevel];
  const levelName = currentInfo?.name ?? 'Raw Egg';
  const levelMultiplier = currentInfo?.multiplier ?? '1.00x';

  const blocksSinceDeposit = currentBlock > depositBlock
    ? currentBlock - depositBlock
    : 0n;

  const isMaxLevel = clampedLevel >= LEVELS.length - 1;
  const nextThreshold = getNextThreshold(clampedLevel);
  const currentThreshold = getCurrentThreshold(clampedLevel);
  const rangeSize = nextThreshold - currentThreshold;

  const progressInRange = Number(blocksSinceDeposit) - currentThreshold;
  const clampedProgress = Math.max(0, Math.min(progressInRange, rangeSize));

  const blocksToNext = isMaxLevel
    ? 0n
    : BigInt(nextThreshold) - blocksSinceDeposit;
  const blocksRemaining = blocksToNext > 0n ? blocksToNext : 0n;

  return (
    <div className="cook-level">
      <div className="cook-level__header">
        <p className="cook-level__name">{levelName}</p>
        <p className="cook-level__multiplier">{levelMultiplier}</p>
      </div>

      <div className="cook-level__steps">
        {LEVELS.map((level, index) => {
          let stepClass = 'cook-level__step';
          if (index === clampedLevel) {
            stepClass += ' cook-level__step--active';
          } else if (index < clampedLevel) {
            stepClass += ' cook-level__step--completed';
          }

          return (
            <div key={level.name} className={stepClass}>
              <span className="cook-level__step-number">
                {String(index + 1)}
              </span>
              <p className="cook-level__step-label">{level.name}</p>
            </div>
          );
        })}
      </div>

      <div className="cook-level__progress">
        {isMaxLevel ? (
          <p className="cook-level__max-label">Maximum cook level reached</p>
        ) : (
          <>
            <ProgressBar
              value={clampedProgress}
              max={rangeSize}
              variant="accent"
              showLabel
              label={`${String(clampedProgress)} / ${String(rangeSize)} blocks`}
              size="md"
            />
            <p className="cook-level__blocks-remaining">
              {FormatService.formatBlocksRemaining(blocksRemaining)} to next level
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export { CookLevelDisplay };
export type { CookLevelDisplayProps };
