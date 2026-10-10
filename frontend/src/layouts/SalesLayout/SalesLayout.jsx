import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SalesHeader } from "./SalesHeader";
import { SalesBottomNav } from "./SalesBottomNav";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { PageTransition, sectionKeyFromPath } from "../../components/motion/PageTransition";
import { CursorFollower } from "../../components/motion/CursorFollower";
import "./SalesLayout.css";

const MOTION_KEY = "leadgen_sales_motion";

const readMotionPref = () => {
  try {
    return localStorage.getItem(MOTION_KEY) !== "off";
  } catch {
    return true;
  }
};

export const SalesLayout = () => {
  const location = useLocation();
  const [motionOn, setMotionOn] = useState(readMotionPref);

  // "Motion" switch in the panel's notch (the reference's mode toggle):
  // turning it off pauses decorative animation for this rep.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = motionOn ? "on" : "off";
    try {
      localStorage.setItem(MOTION_KEY, motionOn ? "on" : "off");
    } catch {
      /* storage unavailable — preference just won't persist */
    }
    return () => {
      delete root.dataset.motion;
    };
  }, [motionOn]);

  return (
    <div className="sales-app-wrapper">
      {motionOn && <CursorFollower />}
      <div className="sales-app-container">
        <SalesHeader />

        <main className="sales-app-content">
          <div className="sales-app-scroll">
            <ErrorBoundary>
              <PageTransition panel="sales" sectionKey={sectionKeyFromPath(location.pathname)}>
                <Outlet />
              </PageTransition>
            </ErrorBoundary>
          </div>

          {/* Notched corner with the motion switch (desktop) */}
          <div className="sales-notch sales-notch--bottom-right">
            <span className="sales-notch-label">Motion</span>
            <div className="sales-switch" role="group" aria-label="Motion">
              <button
                type="button"
                className={motionOn ? "is-active" : ""}
                aria-pressed={motionOn}
                onClick={() => setMotionOn(true)}
              >
                On
              </button>
              <button
                type="button"
                className={!motionOn ? "is-active" : ""}
                aria-pressed={!motionOn}
                onClick={() => setMotionOn(false)}
              >
                Off
              </button>
            </div>
          </div>
        </main>

        <SalesBottomNav />
      </div>
    </div>
  );
};
