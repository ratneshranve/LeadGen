import React from "react";
import { Check, ArrowRight } from "lucide-react";

export const LeadPipeline = ({ currentStatus, onStatusChange }) => {
  const stages = [
    { label: "New", key: "New" },
    { label: "Contacted", key: "Contacted" },
    { label: "Follow-up", key: "Follow-up" },
    { label: "Interested", key: "Interested" },
    { label: "Converted", key: "Converted" },
    { label: "Lost", key: "Lost" },
  ];

  const getStageIndex = (status) => {
    return stages.findIndex((s) => s.key === status);
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="crm-card pipeline-card">
      <div className="pipeline-header">
        <span className="pipeline-label">Pipeline Stage Progress</span>
        <span className="current-status-text">
          Current Status: <strong>{currentStatus}</strong>
        </span>
      </div>

      <div className="pipeline-steps-container">
        {stages.map((stage, idx) => {
          const isCurrent = stage.key === currentStatus;
          const isPassed = currentIndex !== -1 && idx < currentIndex && currentStatus !== "Lost";
          const isLost = stage.key === "Lost" && currentStatus === "Lost";

          return (
            <React.Fragment key={stage.key}>
              {idx > 0 && <div className={`pipeline-line ${isPassed ? "line-passed" : ""}`} />}
              <button
                className={`pipeline-step-btn ${
                  isCurrent
                    ? isLost
                      ? "step-lost"
                      : "step-current"
                    : isPassed
                    ? "step-passed"
                    : ""
                }`}
                onClick={() => onStatusChange(stage.key)}
                title={`Click to set status to ${stage.label}`}
              >
                <div className="step-indicator">
                  {isPassed ? (
                    <Check size={12} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="step-label">{stage.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
