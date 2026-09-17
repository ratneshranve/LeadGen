import React, { useState, useEffect } from "react";
import { Share2, Loader2, Check } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const AddEditSourceModal = ({
  isOpen,
  onClose,
  targetSource,
  existingSources,
  onConfirm,
}) => {
  const isEditing = Boolean(targetSource);

  const [formData, setFormData] = useState({
    name: "",
    type: "Advertising",
    description: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions = [
    "Advertising",
    "Website",
    "Social Media",
    "Referral",
    "Messaging",
    "Manual",
    "Other",
  ];

  useEffect(() => {
    if (targetSource) {
      setFormData({
        name: targetSource.name || "",
        type: targetSource.type || "Advertising",
        description: targetSource.description || "",
        status: targetSource.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        type: "Advertising",
        description: "",
        status: "Active",
      });
    }
    setErrors({});
  }, [targetSource, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Source name is required.";
    } else {
      const isDuplicate = existingSources.some(
        (s) =>
          s.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
          (!targetSource || s.id !== targetSource.id)
      );
      if (isDuplicate) {
        newErrors.name = "A lead source with this name already exists.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onConfirm({
        ...targetSource,
        ...formData,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Lead Source" : "Add Lead Source"}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Source Name */}
          <div className="form-group">
            <label className="form-label">
              Source Name <span className="text-req">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`crm-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Google Ads, Meta Ads, Referral..."
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Source Type & Status Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">
                Source Type <span className="text-req">*</span>
              </label>
              <select
                name="type"
                className="crm-input select-input"
                value={formData.type}
                onChange={handleChange}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="crm-input select-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              name="description"
              className="crm-input crm-textarea"
              rows={3}
              placeholder="Brief description or campaign details for this lead source..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="spin-icon" /> Saving...
                </>
              ) : isEditing ? (
                <>
                  <Check size={15} /> Save Changes
                </>
              ) : (
                <>
                  <Share2 size={15} /> Create Source
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
