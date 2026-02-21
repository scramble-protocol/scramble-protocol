import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement, ReactNode, MouseEvent, KeyboardEvent } from 'react';
import '../../styles/components/modal.css';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg';
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps): ReactElement | null {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: globalThis.KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect((): (() => void) | undefined => {
    if (!isOpen) {
      return undefined;
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside the modal content
    const timer = setTimeout((): void => {
      const el = contentRef.current;
      if (el === null) {
        return;
      }
      const focusable = el.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable !== null) {
        focusable.focus();
      }
    }, 0);

    return (): void => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleCloseKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={contentRef}
        className={`modal-content modal-content--${size}`}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            className="modal__close"
            onClick={onClose}
            onKeyDown={handleCloseKeyDown}
            aria-label="Close modal"
            type="button"
          >
            &#x2715;
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export { Modal };
export type { ModalProps };
