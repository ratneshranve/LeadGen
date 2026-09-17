import React from "react";
import { PipelineColumn } from "./PipelineColumn";

export const PipelineBoard = ({ leads, onViewLead, onMoveStage, onDragStart, onDropLead }) => {
  const stageDefinitions = [
    { key: "New", name: "New", color: "#ff3b19" },
    { key: "Contacted", name: "Contacted", color: "#0891b2" },
    { key: "Follow-up", name: "Follow-up", color: "#d97706" },
    { key: "Interested", name: "Interested", color: "#9333ea" },
    { key: "Converted", name: "Converted", color: "#16a34a" },
    { key: "Lost", name: "Lost", color: "#e11d48" },
  ];

  return (
    <div className="kanban-board-wrapper">
      <div className="kanban-board-scrollable">
        {stageDefinitions.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          return (
            <PipelineColumn
              key={stage.key}
              stageKey={stage.key}
              stageName={stage.name}
              stageColor={stage.color}
              leads={stageLeads}
              onViewLead={onViewLead}
              onMoveStage={onMoveStage}
              onDragStart={onDragStart}
              onDropLead={onDropLead}
            />
          );
        })}
      </div>
    </div>
  );
};
