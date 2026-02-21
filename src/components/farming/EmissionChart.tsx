import type { CSSProperties, ReactElement } from 'react';
import '../../styles/components/emission-chart.css';

interface EmissionChartProps {
  readonly currentBlock: bigint;
  readonly startBlock: bigint;
}

const BLOCKS_PER_MONTH = 4380n;
const TOTAL_MONTHS = 12;

interface MonthData {
  readonly month: number;
  readonly rate: number;
  readonly isCurrent: boolean;
  readonly isPast: boolean;
}

const MONTHLY_EMISSIONS: ReadonlyArray<number> = [
  3_800_000, // Month 1: Pan 3M + LP 800K
  3_250_000, // Month 2
  2_900_000, // Month 3
  2_650_000, // Month 4
  2_400_000, // Month 5
  2_050_000, // Month 6
  1_700_000, // Month 7
  1_450_000, // Month 8
  1_300_000, // Month 9
  1_200_000, // Month 10
  1_100_000, // Month 11
  1_000_000, // Month 12
];

const MAX_MONTHLY_EMISSION = MONTHLY_EMISSIONS[0];

function computeEmissionRate(month: number): number {
  if (month < 0 || month >= MONTHLY_EMISSIONS.length) {
    return 0;
  }
  return MONTHLY_EMISSIONS[month] / MAX_MONTHLY_EMISSION;
}

function computeMonthData(
  currentBlock: bigint,
  startBlock: bigint,
): ReadonlyArray<MonthData> {
  const blocksSinceStart =
    currentBlock > startBlock ? currentBlock - startBlock : 0n;
  const currentMonthIndex =
    BLOCKS_PER_MONTH > 0n
      ? Number(blocksSinceStart / BLOCKS_PER_MONTH)
      : 0;

  const months: MonthData[] = [];
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    months.push({
      month: i + 1,
      rate: computeEmissionRate(i),
      isCurrent: i === currentMonthIndex && currentMonthIndex < TOTAL_MONTHS,
      isPast: i < currentMonthIndex,
    });
  }
  return months;
}

function computeTotalEmissions(): number {
  let total = 0;
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    total += MONTHLY_EMISSIONS[i];
  }
  return total;
}

function EmissionChart({
  currentBlock,
  startBlock,
}: EmissionChartProps): ReactElement {
  const months = computeMonthData(currentBlock, startBlock);
  const totalRelative = computeTotalEmissions();

  const blocksSinceStart =
    currentBlock > startBlock ? currentBlock - startBlock : 0n;
  const currentMonthIndex = Number(blocksSinceStart / BLOCKS_PER_MONTH);
  const monthsRemaining = Math.max(0, TOTAL_MONTHS - currentMonthIndex);
  const currentMonthEmission =
    currentMonthIndex < TOTAL_MONTHS
      ? MONTHLY_EMISSIONS[currentMonthIndex]
      : 0;

  return (
    <div className="emission-chart">
      <div className="emission-chart__chart">
        {months.map(function (data: MonthData): ReactElement {
          const heightPercent = Math.round(data.rate * 100);
          const barClass = [
            'emission-chart__bar',
            data.isCurrent ? 'emission-chart__bar--current' : '',
            data.isPast ? 'emission-chart__bar--past' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const barStyle: CSSProperties = {
            '--emission-bar-height': `${String(heightPercent)}%`,
          } as CSSProperties;

          return (
            <div key={data.month} className="emission-chart__bar-wrapper">
              <div className={barClass} style={barStyle} />
              <span className="emission-chart__bar-label">
                M{String(data.month)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="emission-chart__legend">
        <div className="emission-chart__legend-item">
          <p className="emission-chart__legend-label">Total Emissions</p>
          <p className="emission-chart__legend-value">
            {totalRelative.toLocaleString()} $EGG
          </p>
        </div>
        <div className="emission-chart__legend-item">
          <p className="emission-chart__legend-label">Current Month</p>
          <p className="emission-chart__legend-value">
            {currentMonthEmission.toLocaleString()} $EGG
          </p>
        </div>
        <div className="emission-chart__legend-item">
          <p className="emission-chart__legend-label">Months Remaining</p>
          <p className="emission-chart__legend-value">
            {String(monthsRemaining)} / {String(TOTAL_MONTHS)}
          </p>
        </div>
      </div>
    </div>
  );
}

export { EmissionChart };
export type { EmissionChartProps };
