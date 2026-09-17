import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import "./ImportExport.css";

export const ImportExport = () => {
  const [exportType, setExportType] = useState("Leads");
  const [exportFormat, setExportFormat] = useState("CSV");

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Mock Export History
  const [exportHistory, setExportHistory] = useState([
    { name: "all_leads_export_sep.csv", type: "Leads", records: 184, user: "Rajesh Kumar", date: "Sep 01, 2026", status: "Completed" },
    { name: "followups_summary_aug.xlsx", type: "Follow-ups", records: 48, user: "Rajesh Kumar", date: "Aug 30, 2026", status: "Completed" },
    { name: "team_performance_aug.xlsx", type: "Users", records: 8, user: "Rajesh Kumar", date: "Aug 25, 2026", status: "Completed" },
  ]);

  // Dataset Generator per Module
  const getModuleData = (type) => {
    switch (type) {
      case "Leads":
        return {
          headers: ["Lead ID", "Full Name", "Company", "Phone", "Email", "Status", "Source", "Category", "Assigned Employee", "Created Date"],
          rows: [
            ["LD-101", "Rahul Sharma", "Rahul Traders", "+91 98765 43210", "rahul@rahultraders.com", "New", "Google Ads", "Enterprise", "Amit Sharma", "Sep 01, 2026"],
            ["LD-102", "Suresh Patel", "Patel Chemicals", "+91 98765 11111", "suresh@patelchem.com", "Contacted", "Website", "SMB", "Neha Verma", "Sep 01, 2026"],
            ["LD-103", "Ananya Roy", "Roy Technologies", "+91 98765 22222", "ananya@roytech.com", "Interested", "Meta Ads", "Mid-Market", "Rahul Mehta", "Aug 30, 2026"],
            ["LD-104", "Vikram Singh", "Singh Logistics", "+91 98765 33333", "vikram@singhlog.com", "Converted", "Referral", "Enterprise", "Priya Singh", "Aug 28, 2026"],
            ["LD-105", "Deepak Gupta", "Gupta Enterprises", "+91 98765 44444", "deepak@guptaent.com", "Follow-up", "WhatsApp", "SMB", "Amit Sharma", "Aug 27, 2026"],
          ]
        };
      case "Follow-ups":
        return {
          headers: ["Follow-up ID", "Lead Name", "Scheduled Date", "Priority", "Category", "Assigned Employee", "Status"],
          rows: [
            ["FL-201", "Rahul Sharma", "Sep 05, 2026", "High", "Product Demo", "Amit Sharma", "Pending"],
            ["FL-202", "Suresh Patel", "Sep 04, 2026", "Medium", "Price Quotation", "Neha Verma", "Pending"],
            ["FL-203", "Ananya Roy", "Sep 03, 2026", "Urgent", "Contract Signing", "Rahul Mehta", "Completed"],
            ["FL-204", "Deepak Gupta", "Sep 06, 2026", "Low", "General Check-in", "Priya Singh", "Pending"],
          ]
        };
      case "Users":
        return {
          headers: ["User ID", "Full Name", "Email", "Phone", "Role", "Account Status", "Date of Birth"],
          rows: [
            ["USR-301", "Rajesh Kumar", "admin@leadcrm.com", "+91 98000 11111", "Admin", "Active", "1988-05-14"],
            ["USR-302", "Amit Sharma", "amit@leadcrm.com", "+91 98000 22222", "Sales Employee", "Active", "1994-08-22"],
            ["USR-303", "Neha Verma", "neha@leadcrm.com", "+91 98000 33333", "Sales Employee", "Active", "1996-11-05"],
            ["USR-304", "Rahul Mehta", "rahul@leadcrm.com", "+91 98000 44444", "Sales Employee", "Active", "1992-03-18"],
            ["USR-305", "Priya Singh", "priya@leadcrm.com", "+91 98000 55555", "Sales Employee", "Inactive", "1995-09-30"],
          ]
        };
      case "Activity History":
      default:
        return {
          headers: ["Activity ID", "User", "Action", "Entity", "Details", "Timestamp"],
          rows: [
            ["ACT-401", "Rajesh Kumar", "Updated Lead", "LD-101", "Changed status from New to Contacted", "Sep 02, 2026 10:30 AM"],
            ["ACT-402", "Amit Sharma", "Added Lead Source", "WhatsApp", "Registered new acquisition channel", "Sep 01, 2026 04:15 PM"],
            ["ACT-403", "Neha Verma", "Completed Follow-up", "FL-203", "Sent quotation document via email", "Aug 30, 2026 11:00 AM"],
          ]
        };
    }
  };

  const handleRunExport = (overrideType = null, overrideFormat = null) => {
    const targetType = overrideType || exportType;
    const targetFormat = overrideFormat || exportFormat;
    const data = getModuleData(targetType);

    const isExcel = targetFormat.toLowerCase().includes("excel") || targetFormat.toLowerCase().includes("xlsx");
    const extension = isExcel ? "xlsx" : "csv";
    const filename = `${targetType.toLowerCase().replace(/\s+/g, "_")}_export_${Date.now()}.${extension}`;

    let fileBlob;

    if (isExcel) {
      // Build clean XML Spreadsheet structure for Microsoft Excel (.xlsx)
      const xmlRows = data.rows.map(
        (r) => `    <Row>\n${r.map((c) => `      <Cell><Data ss:Type="String">${String(c).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`).join("\n")}\n    </Row>`
      ).join("\n");

      const xmlHeader = `    <Row>\n${data.headers.map((h) => `      <Cell><Data ss:Type="String">${h}</Data></Cell>`).join("\n")}\n    </Row>`;

      const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${targetType}">
  <Table>
${xmlHeader}
${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

      fileBlob = new Blob([excelXml], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    } else {
      // Build clean UTF-8 BOM CSV format
      const csvLines = [
        data.headers.join(","),
        ...data.rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      fileBlob = new Blob(["\uFEFF" + csvLines], { type: "text/csv;charset=utf-8;" });
    }

    // Trigger Browser File Download
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record in History Table
    const newHistoryRecord = {
      name: filename,
      type: targetType,
      records: data.rows.length,
      user: "Rajesh Kumar",
      date: "Just now",
      status: "Completed"
    };
    setExportHistory((prev) => [newHistoryRecord, ...prev]);

    setToastMessage(`Exported ${targetType} data successfully as .${extension.toUpperCase()}`);
    setIsToastOpen(true);
  };

  return (
    <div className="import-export-page">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      {/* Description Banner */}
      <div className="ie-header-banner">
        <p className="page-desc">Export your CRM data, lead records, and reports in CSV or Excel format.</p>
      </div>

      {/* EXPORT DATA CARD */}
      <div className="crm-card ie-main-card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fed7aa", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.12)" }}>
        <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", borderBottom: "1px solid #fdba74" }}>
          <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
            <Download size={18} className="text-indigo" /> Export Data
          </h3>
        </div>

        <div className="export-form-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "flex-end" }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.825rem", color: "#0f172a", marginBottom: "6px", display: "block" }}>
              Data Module to Export *
            </label>
            <CustomSelect
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              options={[
                { value: "Leads", label: "Leads (All 184 records)" },
                { value: "Follow-ups", label: "Follow-ups Schedule" },
                { value: "Users", label: "Users & Sales Employees" },
                { value: "Activity History", label: "Activity Audit Logs" },
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.825rem", color: "#0f172a", marginBottom: "6px", display: "block" }}>
              Export File Format *
            </label>
            <div className="format-options-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {["CSV", "Excel (.xlsx)"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className={`format-btn ${exportFormat === fmt ? "active" : ""}`}
                  onClick={() => setExportFormat(fmt)}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #fdba74" }}>
          <button className="crm-btn crm-btn-primary" onClick={() => handleRunExport()}>
            <Download size={15} /> Export Data Now
          </button>
        </div>
      </div>

      {/* Recent Export History Table */}
      <div className="crm-card ie-history-card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #86efac", boxShadow: "0 4px 14px rgba(34, 197, 94, 0.12)" }}>
        <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", borderBottom: "1px solid #86efac" }}>
          <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
            <FileText size={18} className="text-indigo" /> Recent Export History
          </h3>
          <span className="section-count-pill" style={{ background: "#14532d", color: "#ffffff" }}>{exportHistory.length} Files</span>
        </div>

        <div className="table-responsive-container" style={{ marginTop: "14px" }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Records</th>
                <th>Created By</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((item) => {
                const itemFormat = item.name.endsWith(".xlsx") ? "Excel (.xlsx)" : "CSV";
                return (
                  <tr key={item.name}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.type}</td>
                    <td>{item.records}</td>
                    <td>{item.user}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className="status-badge-chip status-active">
                        <span className="status-dot" /> {item.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-xs"
                        onClick={() => handleRunExport(item.type, itemFormat)}
                      >
                        <Download size={13} /> Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
