import type React from 'react';

/** Pointer position in the SVG's own viewBox units. */
export function svgPoint(svg: SVGSVGElement, e: React.PointerEvent) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Pointer handlers that call `onMove` with viewBox coordinates while the
 * pointer is held down anywhere on the SVG.
 */
export function dragHandlers(onMove: (p: { x: number; y: number }) => void) {
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e);
    if (p) onMove(p);
  };
  return {
    onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      move(e);
    },
    onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
    },
  };
}

/** Arrow / Home / End handling for an element with role="slider". */
export function sliderKeys(
  value: number,
  set: (v: number) => void,
  { min, max, step }: { min: number; max: number; step: number },
) {
  return (e: React.KeyboardEvent) => {
    const next: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + step * 4,
      PageDown: value - step * 4,
      Home: min,
      End: max,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    set(Math.min(max, Math.max(min, next[e.key])));
  };
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
