'use client';
import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, wide = false, dismissible = true }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  dismissible?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} className={`modal bottom-sheet ${wide ? 'wide' : ''}`} onCancel={(event) => { event.preventDefault(); if (dismissible) onClose(); }} onClick={(event) => { if (dismissible && event.target === event.currentTarget) onClose(); }} aria-labelledby={titleId}>
    <div className="modal-inner">
      <div className="sheet-handle" aria-hidden="true" />
      <header><div><small>MY TREND BUYER SHOP</small><h2 id={titleId}>{title}</h2></div>{dismissible && <button className="icon-btn" onClick={onClose} aria-label="关闭弹窗"><X /></button>}</header>
      <div className="sheet-scroll">{children}</div>
    </div>
  </dialog>;
}
