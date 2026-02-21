import { useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import '../../styles/components/page-layout.css';

interface PageLayoutProps {
  readonly children: ReactNode;
  readonly title?: string;
}

function PageLayout({ children, title }: PageLayoutProps): ReactElement {
  useEffect((): void => {
    if (title !== undefined) {
      document.title = `${title} | Scramble Protocol`;
    }
  }, [title]);

  return (
    <div className="page-layout">
      <Header />
      <main className="page-layout__content">{children}</main>
      <Footer />
    </div>
  );
}

export { PageLayout };
export type { PageLayoutProps };
