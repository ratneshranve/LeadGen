import React, { useId } from "react";

// Admin mark: stacked chevrons in electric blue with an ember underline —
// the two-tone arrow logo of the navy lead-management reference.
export const AdminLogoMark = ({ size = 34, className = "" }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`am-b-${id}`} x1="6" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7fb0ff" />
          <stop offset="1" stopColor="#2b6beb" />
        </linearGradient>
        <linearGradient id={`am-o-${id}`} x1="14" y1="22" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff9a4d" />
          <stop offset="1" stopColor="#e8691c" />
        </linearGradient>
      </defs>
      <path d="M7 8.5 L27.5 8.5 L33 14 L20 14 L12.5 21.5 L7 16 Z" fill={`url(#am-b-${id})`} />
      <path d="M12.5 21.5 L20 14 L26 20 L18.5 27.5 Z" fill="#9cc2ff" opacity="0.9" />
      <path d="M18.5 27.5 L26 20 L34 28 L26.5 35.5 Z" fill={`url(#am-o-${id})`} />
    </svg>
  );
};

// Sales mark: ink tile with a lime tick, echoing the compact square logo of
// the ink & cream reference.
export const SalesLogoMark = ({ size = 30, className = "", inverted = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" fill={inverted ? "#f4f576" : "#1b1a1d"} stroke={inverted ? "#1b1a1d" : "#ffffff"} strokeOpacity={inverted ? 1 : 0.18} />
    <path d="M9 16.5 L14 21.5 L23.5 11" stroke={inverted ? "#1b1a1d" : "#f4f576"} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WAVE = "M18 118 C52 84 98 136 148 108 C196 82 246 128 300 100 L300 128 C250 158 200 110 150 138 C100 166 54 116 18 148 Z";

// Floating stack of rippled sheets with a lens on top — a 2D homage to the
// 3D hero object in the ink & cream reference. Each layer drifts on its own
// timing so the stack breathes while the whole piece floats.
export const FloatingStack = ({ className = "", style }) => {
  const id = useId().replace(/:/g, "");
  const layers = [
    { fill: `url(#fs-silver-${id})`, y: 54, delay: "-0.4s" },
    { fill: `url(#fs-ember-${id})`, y: 40, delay: "-1.2s" },
    { fill: "#2f2e33", y: 28, delay: "-2s" },
    { fill: `url(#fs-lime-${id})`, y: 14, delay: "-2.8s" },
    { fill: `url(#fs-silver2-${id})`, y: 0, delay: "-3.4s" },
  ];

  return (
    <div className={`lg-float ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 320 250" width="100%" height="100%" fill="none">
        <defs>
          <linearGradient id={`fs-silver-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f6f6f8" />
            <stop offset="0.55" stopColor="#c9cbd2" />
            <stop offset="1" stopColor="#8f929b" />
          </linearGradient>
          <linearGradient id={`fs-silver2-${id}`} x1="0" y1="0" x2="1" y2="0.6">
            <stop stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#d9dbe0" />
            <stop offset="1" stopColor="#a7aab2" />
          </linearGradient>
          <linearGradient id={`fs-lime-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#fbfcb0" />
            <stop offset="0.5" stopColor="#f4f576" />
            <stop offset="1" stopColor="#c9cb2c" />
          </linearGradient>
          <linearGradient id={`fs-ember-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#ffb36b" />
            <stop offset="0.6" stopColor="#f07a1f" />
            <stop offset="1" stopColor="#c85f0e" />
          </linearGradient>
          <radialGradient id={`fs-lens-${id}`} cx="0.38" cy="0.35" r="0.7">
            <stop stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#d8dae0" />
            <stop offset="1" stopColor="#7d808a" />
          </radialGradient>
          <radialGradient id={`fs-iris-${id}`} cx="0.42" cy="0.4" r="0.6">
            <stop stopColor="#5d8dff" />
            <stop offset="0.55" stopColor="#1d3c9a" />
            <stop offset="1" stopColor="#0a1238" />
          </radialGradient>
          <filter id={`fs-shadow-${id}`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#1b1a1d" floodOpacity="0.18" />
          </filter>
        </defs>

        <g filter={`url(#fs-shadow-${id})`}>
          {layers.map((layer, i) => (
            <g key={i} className="lg-float-alt" style={{ animationDelay: layer.delay, transformOrigin: "160px 120px" }}>
              <path d={WAVE} fill={layer.fill} transform={`translate(0 ${layer.y})`} />
            </g>
          ))}
        </g>

        <g className="lg-float-alt" style={{ animationDuration: "4.2s", transformOrigin: "176px 84px" }}>
          <ellipse cx="176" cy="122" rx="40" ry="8" fill="#1b1a1d" opacity="0.12" />
          <circle cx="176" cy="84" r="34" fill={`url(#fs-lens-${id})`} />
          <circle cx="176" cy="84" r="22" fill="#1b1a1d" />
          <circle cx="176" cy="84" r="16" fill={`url(#fs-iris-${id})`} />
          <circle cx="170" cy="78" r="5" fill="#ffffff" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
};
