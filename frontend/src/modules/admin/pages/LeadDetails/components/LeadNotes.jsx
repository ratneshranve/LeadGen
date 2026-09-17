import React, { useState } from "react";
import { FileText, Plus, MessageSquare } from "lucide-react";

export const LeadNotes = ({ notesList, onAddNote }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    onAddNote(newNoteText);
    setNewNoteText("");
    setIsAdding(false);
  };

  return (
    <div className="crm-card detail-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <FileText size={18} className="text-indigo" /> Lead Notes
        </h3>
        {!isAdding && (
          <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Add Note
          </button>
        )}
      </div>

      <div className="notes-body">
        {/* Inline Add Note Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="add-note-inline-form">
            <textarea
              className="crm-input crm-textarea"
              rows={3}
              placeholder="Add notes about this lead..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              autoFocus
            />
            <div className="form-actions-inline">
              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
              <button type="submit" className="crm-btn crm-btn-primary crm-btn-sm">
                Save Note
              </button>
            </div>
          </form>
        )}

        {/* Existing Notes List */}
        <div className="notes-list">
          {notesList.map((note) => (
            <div key={note.id} className="note-item-box">
              <p className="note-text">"{note.content}"</p>
              <div className="note-meta">
                <span>By {note.author}</span>
                <span className="dot-sep">•</span>
                <span>{note.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
