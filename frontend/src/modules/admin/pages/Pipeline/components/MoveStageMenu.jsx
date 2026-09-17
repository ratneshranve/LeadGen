import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, ArrowRight } from "lucide-react";

export const MoveStageMenu = ({ lead, onViewLead, onMoveStage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const menuRef = useRef(null);

  const stages = ["New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowSubMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="card-menu-wrapper" ref={menuRef}>
      <button
        className="card-menu-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowSubMenu(false);
        }}
        title="Card Actions"
      >
        <MoreVertical size={14} />
      </button>

      {isOpen && (
        <div className="kanban-card-dropdown">
          <button
            className="dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onViewLead(lead.id);
            }}
          >
            <Eye size={13} /> View Lead
          </button>

          <div
            className="dropdown-item dropdown-has-submenu"
            onMouseEnter={() => setShowSubMenu(true)}
            onClick={(e) => {
              e.stopPropagation();
              setShowSubMenu(!showSubMenu);
            }}
          >
            <span><ArrowRight size={13} /> Move to Stage</span>
            <span className="submenu-arrow">›</span>

            {showSubMenu && (
              <div className="dropdown-submenu">
                {stages.map((st) => (
                  <button
                    key={st}
                    className={`submenu-item ${lead.status === st ? "active-stage" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      setShowSubMenu(false);
                      if (lead.status !== st) {
                        onMoveStage(lead.id, st);
                      }
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
