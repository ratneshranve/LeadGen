// Adapts a backend FollowUp document (backend/src/models/FollowUp.model.js, populated with
// leadId/assignedTo) into the flat shape the FollowUps UI components were built against.
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const computeDateLabel = (scheduled, status) => {
  if (status === "Completed") return "Completed";
  if (status === "Cancelled") return "Cancelled";
  const today = startOfDay(new Date());
  const target = startOfDay(scheduled);
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return "Upcoming";
};

export const adaptFollowUp = (f) => {
  const scheduled = new Date(f.scheduledAt);
  return {
    id: f._id,
    leadId: f.leadId?._id || f.leadId,
    leadName: f.leadId?.name || "Lead",
    company: f.leadId?.company || "",
    phone: f.leadId?.phone || "",
    email: f.leadId?.email || "",
    type: f.type,
    notes: f.notes || "",
    assignedTo: f.assignedTo?.name || "Unassigned",
    assignedToId: f.assignedTo?._id || f.assignedTo,
    date: scheduled.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    dateStr: scheduled.toISOString().split("T")[0],
    time: scheduled.toTimeString().slice(0, 5),
    status: f.status,
    dateLabel: computeDateLabel(scheduled, f.status),
    raw: f,
  };
};
