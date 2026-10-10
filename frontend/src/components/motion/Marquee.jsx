import React from "react";

// Infinite horizontal ticker (the partner-logo strip of the ink & cream
// reference). Children are rendered twice so the -50% loop is seamless.
export const Marquee = ({ children, speed = 32, className = "", gap = 12 }) => (
  <div className={`lg-marquee ${className}`} style={{ "--lg-marquee-speed": `${speed}s` }}>
    <div className="lg-marquee-track" style={{ gap }}>
      <div style={{ display: "flex", gap, flexShrink: 0 }}>{children}</div>
      <div style={{ display: "flex", gap, flexShrink: 0 }} aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);
