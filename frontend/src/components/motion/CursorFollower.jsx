import React, { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, .lg-cursor-grow";

// Soft grey dot that trails the pointer and swells over interactive elements,
// as in the ink & cream reference. Desktop pointers only; the native cursor
// stays visible so nothing about clicking changes.
export const CursorFollower = () => {
  const dotRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!dot || !fine || reduce) return undefined;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let frame;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.dataset.visible = "true";
      dot.dataset.hover = e.target.closest?.(INTERACTIVE) ? "true" : "false";
    };
    const onLeave = () => {
      dot.dataset.visible = "false";
    };
    const onDown = () => {
      dot.dataset.press = "true";
    };
    const onUp = () => {
      dot.dataset.press = "false";
    };

    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      const vx = x - cx;
      const vy = y - cy;
      // Stretch slightly along the direction of travel
      const speed = Math.min(Math.hypot(vx, vy) / 60, 0.45);
      const angle = Math.atan2(vy, vx);
      dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${angle}rad) scale(${1 + speed}, ${1 - speed * 0.6})`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={dotRef} className="lg-cursor" data-visible="false" aria-hidden="true">
      <span className="lg-cursor-dot" />
    </div>
  );
};
