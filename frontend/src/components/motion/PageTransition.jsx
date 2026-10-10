import React from "react";

// Route-level entrance for each panel (keyframes in styles/motion.css).
//  admin: the workspace swings in from a slight 3D tilt and settles flat —
//         the perspective fly-in that opens the lead-management reference.
//  sales: content rises out of the cream panel with a soft blur, like the
//         section-by-section reveal of the ink & cream reference.
// A CSS animation (fill-mode: backwards) is used instead of a motion wrapper
// so no transform/filter is left on the wrapper afterwards; a lingering
// transform would turn it into the containing block for the many
// `position: fixed` modals rendered inside pages.
//
// `sectionKey` should change per section (e.g. "/admin/leads"), not per full
// path, so navigating within a section doesn't remount the page.
export const PageTransition = ({ panel = "admin", sectionKey, children }) => (
  <div key={sectionKey} className={`lg-page lg-page-${panel}`}>
    {children}
  </div>
);

export const sectionKeyFromPath = (pathname = "") => pathname.split("/").slice(0, 3).join("/");
