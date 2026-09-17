import React from "react";
import {
  Calendar as CalendarIcon,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  Video,
  CheckCircle2,
  Eye,
  Edit3,
  CheckSquare,
  Trash2
} from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { Badge } from "../../../../../components/ui/Badge";
import { useAuth } from "../../../../../context/AuthContext";

export const EventDetailsModal = ({
  isOpen,
  onClose,
  event,
  onMarkCompleted,
  onEdit,
  onDelete,
  onViewLead
}) => {
  const { isAdmin } = useAuth();

  if (!event) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "Call":
        return <Phone size={15} />;
      case "WhatsApp":
        return <MessageSquare size={15} />;
      case "Email":
        return <Mail size={15} />;
      case "Meeting":
        return <Video size={15} />;
      default:
        return <CheckSquare size={15} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "AS";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const isCompleted = event.status === "Completed";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activity Details" maxWidth="620px">
      <div className="event-details-content">
        {/* Top Header Identity */}
        <div className="event-details-header">
          <div className="type-badge-row">
            <span className={`channel-pill-sm ${event.type?.toLowerCase()}`}>
              {getTypeIcon(event.type)} {event.type}
            </span>
            <Badge status={event.leadStatus || "Follow-up"} />
          </div>

          <h3 className="event-lead-title">{event.leadName}</h3>
          {event.company && (
            <span className="event-company-name">
              <Building2 size={13} /> {event.company}
            </span>
          )}
        </div>

        <div className="dropdown-divider" style={{ margin: "14px 0" }} />

        {/* Event Attributes Grid */}
        <div className="event-info-grid">
          <div className="event-info-item">
            <span className="info-lbl">Date & Time</span>
            <div className="info-val-row">
              <CalendarIcon size={14} className="text-indigo" />
              <span>{event.date} at {event.time}</span>
            </div>
          </div>

          <div className="event-info-item">
            <span className="info-lbl">Assigned Sales Employee</span>
            <div className="info-val-row">
              <span className="rep-avatar-xs">{getInitials(event.assignedTo)}</span>
              <span>{event.assignedTo}</span>
            </div>
          </div>

          {event.reminder && event.reminder !== "None" && (
            <div className="event-info-item">
              <span className="info-lbl">Reminder Alert</span>
              <span className="info-val-text">{event.reminder}</span>
            </div>
          )}
        </div>

        {/* Agenda / Notes Section */}
        <div className="event-agenda-box">
          <span className="info-lbl">Agenda / Notes</span>
          <p className="agenda-text">"{event.notes || "No notes attached to this activity."}"</p>
        </div>

        {/* Modal Action CTAs - Close Only */}
        <div className="modal-actions-footer">
          <button className="crm-btn crm-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
