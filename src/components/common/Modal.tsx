import type { ReactElement, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/8bit/dialog.js';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const;

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps): ReactElement {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean): void => { if (!open) onClose(); }}>
      <DialogContent className={SIZE_CLASSES[size]} font="normal">
        <DialogHeader>
          <DialogTitle className="font-retro text-sm" font="normal">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export { Modal };
export type { ModalProps };
