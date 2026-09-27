// Adapts a backend Lead document (backend/src/models/Lead.model.js, populated with
// sourceId/categoryId/stageId/assignedTo) into the flat shape the Leads UI components
// were originally built against (id, source, salesperson, category as plain strings).
// This lets the existing table/filter/modal components work unchanged while the data
// underneath is real.
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

export const adaptLead = (lead) => ({
  _id: lead._id,
  id: lead._id,
  customLeadId: lead.customLeadId,
  name: lead.name,
  company: lead.company || "",
  phone: lead.phone,
  email: lead.email || "",
  source: lead.sourceId?.name || "Unknown",
  sourceId: lead.sourceId?._id || lead.sourceId || null,
  status: lead.status,
  category: lead.categoryId?.name || "",
  categoryId: lead.categoryId?._id || lead.categoryId || null,
  leadType: lead.categoryId?.name || "",
  stageId: lead.stageId?._id || lead.stageId || null,
  stageName: lead.stageId?.name || "",
  salesperson: lead.assignedTo?.name || "Unassigned",
  assignedTo: lead.assignedTo?._id || lead.assignedTo || null,
  score: lead.score ?? null,
  priority: lead.priority || null,
  estimatedValue: lead.estimatedValue || 0,
  notes: lead.notes || "",
  createdDate: formatDate(lead.createdAt),
  createdAt: lead.createdAt,
  raw: lead,
});
