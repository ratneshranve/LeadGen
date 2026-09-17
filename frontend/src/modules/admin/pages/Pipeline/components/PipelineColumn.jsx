import React, { useState } from "react";
import { LeadCard } from "./LeadCard";

export const PipelineColumn = ({
  stageKey,
  stageName,
  stageColor,
  leads,
  onViewLead,
  onMoveStage,
  onDragStart,
  onDropLead,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      onDropLead(leadId, stageKey);
    }
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? "column-drag-over" : ""} stage-${stageKey.toLowerCase().replace(/[^a-z0-9]/g, "")}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="column-header">
        <div className="header-title-flex">
          <span className="stage-indicator-dot" style={{ backgroundColor: stageColor }} />
          <h3 className="column-title">{stageName}</h3>
          <span className="column-count-badge">{leads.length}</span>
        </div>
        <div className="column-color-bar" style={{ backgroundColor: stageColor }} />
      </div>

      {/* Cards Scrollable Body */}
      <div className="column-cards-container">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onViewLead={onViewLead}
              onMoveStage={onMoveStage}
              onDragStart={onDragStart}
            />
          ))
        ) : (
          <div className="empty-column-box">
            <span className="empty-text">No leads in this stage</span>
          </div>
        )}
      </div>
    </div>
  );
};
