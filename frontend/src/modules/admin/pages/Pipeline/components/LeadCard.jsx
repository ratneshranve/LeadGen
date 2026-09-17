import React from "react";
import { Building2, Calendar, Phone, Share2, UserCheck } from "lucide-react";
import { MoveStageMenu } from "./MoveStageMenu";

export const LeadCard = ({ lead, onViewLead, onMoveStage, onDragStart }) => {
  const getInitials = (name) => {
    if (!name || name === "Unassigned") return "UA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const isUnassigned = !lead.salesperson || lead.salesperson === "Unassigned";

  return (
    <div
      className="kanban-lead-card"
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
    >
      <div className="card-top-row">
        <span className="lead-card-type">{lead.leadType || "Enterprise"}</span>
        <MoveStageMenu
          lead={lead}
          onViewLead={onViewLead}
          onMoveStage={onMoveStage}
        />
      </div>

      <div className="card-identity-box">
        <h4
          className="lead-card-title"
          onClick={() => onViewLead(lead.id)}
          title="View Lead Details"
        >
          {lead.name}
        </h4>
        <span className="lead-card-company">
          <Building2 size={12} /> {lead.company}
        </span>
      </div>

      <div className="card-tags-row">
        <span className="card-source-chip">
          <Share2 size={11} /> {lead.source}
        </span>
      </div>

      {/* Follow-up info if present */}
      {lead.followupDate && lead.followupDate !== "No follow-up" && (
        <div className="card-followup-line">
          <Calendar size={12} className="text-amber" />
          <span>{lead.followupDate}</span>
        </div>
      )}

      {/* Bottom Rep Footer */}
      <div className="card-footer-row">
        <div className="rep-chip">
          <span className={`rep-avatar-xs ${isUnassigned ? "unassigned-avatar" : ""}`}>
            {getInitials(lead.salesperson)}
          </span>
          <span className="rep-chip-name">
            {lead.salesperson || "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  );
};
