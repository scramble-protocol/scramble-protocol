import { useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Header } from './Header.js';
import { Footer } from './Footer.js';

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export { PageLayout };
export type { PageLayoutProps };
