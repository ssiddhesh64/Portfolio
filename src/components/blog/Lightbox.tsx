import React, { useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ZoomableProps {
  /** Names what opens, e.g. the image's alt text. */
  label: string;
  /** What shows in the column. */
  children: React.ReactNode;
  /** What shows full screen; defaults to the same content. */
  full?: React.ReactNode;
  caption?: React.ReactNode;
}

/**
 * Wraps a figure's content in a button that opens it in a full-screen
 * <dialog>. The native dialog traps focus, closes on Esc and restores focus.
 */
export const Zoomable: React.FC<ZoomableProps> = ({
  label,
  children,
  full,
  caption,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  // The full view mounts only while open, so a diagram's SVG (and its ids)
  // is in the page once.
  const [open, setOpen] = useState(false);
  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
  };
  return (
    <>
      <button
        type="button"
        className="figure__zoom"
        onClick={show}
        aria-label={`View full size: ${label}`}
      >
        {children}
        <span className="figure__zoom-hint" aria-hidden>
          <Maximize2 size={14} />
        </span>
      </button>
      {/* A click on the dialog itself, not its contents, is a backdrop click. */}
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={label}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <button
          type="button"
          className="icon-button lightbox__close"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
        >
          <X size={18} aria-hidden />
        </button>
        {open && (
          <>
            <div className="lightbox__content">{full ?? children}</div>
            {caption && <p className="lightbox__caption">{caption}</p>}
          </>
        )}
      </dialog>
    </>
  );
};
