import type { ReactElement, ReactNode } from 'react';
import '../../styles/components/card.css';

interface CardProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly glow?: 'egg' | 'sizzle' | 'none';
  readonly children: ReactNode;
  readonly className?: string;
}

function Card({
  title,
  subtitle,
  glow = 'none',
  children,
  className,
}: CardProps): ReactElement {
  const glowClass = glow !== 'none' ? `card--glow-${glow}` : '';
  const classNames = ['card', glowClass, className]
    .filter(Boolean)
    .join(' ');

  const hasHeader = title !== undefined || subtitle !== undefined;

  return (
    <div className={classNames}>
      {hasHeader && (
        <div className="card__header">
          {title !== undefined && <h3 className="card__title">{title}</h3>}
          {subtitle !== undefined && (
            <p className="card__subtitle">{subtitle}</p>
          )}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
}

export { Card };
export type { CardProps };
