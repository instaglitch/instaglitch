import React from 'react';
import clsx from 'clsx';
import { BsX } from 'react-icons/bs';

export interface ModalProps {
  className?: string;
  title?: React.ReactNode;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  className,
  title,
  children,
  onDismiss,
}) => {
  return (
    <div className="overlay" onClick={onDismiss}>
      <div
        className={clsx('modal', className)}
        onClick={e => e.stopPropagation()}
      >
        <div className="title">
          {title}
          {!!onDismiss && (
            <button className="close" onClick={onDismiss}>
              <BsX />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
