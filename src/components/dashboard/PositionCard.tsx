import type { CSSProperties, ReactElement } from 'react';
import { Button } from '../common/index.js';
import '../../styles/components/position-card.css';

interface PositionItem {
  readonly label: string;
  readonly value: string;
  readonly accent?: string;
}

interface PositionAction {
  readonly label: string;
  readonly onClick: () => void;
}

interface PositionCardProps {
  readonly title: string;
  readonly items: ReadonlyArray<PositionItem>;
  readonly action?: PositionAction;
}

function PositionCard({
  title,
  items,
  action,
}: PositionCardProps): ReactElement {
  return (
    <div className="position-card">
      <h3 className="position-card__title">{title}</h3>

      <div className="position-card__items">
        {items.map(function (item: PositionItem): ReactElement {
          const accentStyle: CSSProperties | undefined =
            item.accent !== undefined
              ? ({ '--position-card-accent': item.accent } as CSSProperties)
              : undefined;

          const valueClass =
            item.accent !== undefined
              ? 'position-card__item-value position-card__item-value--accented'
              : 'position-card__item-value';

          return (
            <div key={item.label} className="position-card__item">
              <p className="position-card__item-label">{item.label}</p>
              <p className={valueClass} style={accentStyle}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {action !== undefined && (
        <div className="position-card__action">
          <Button
            variant="secondary"
            size="sm"
            onClick={action.onClick}
            fullWidth={true}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export { PositionCard };
export type { PositionCardProps };
