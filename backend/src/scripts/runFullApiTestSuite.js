const http = require("http");
const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../../config/db");
const config = require("../../config/env");
const logger = require("../utils/logger");

// ─────────────────────────────────────────────────────────────────────────────
// HTTP TEST CLIENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function runFullSuite() {
  console.log("\n============================================================");
  console.log(" 🧪 STARTING COMPLETE END-TO-END BACKEND API TEST SUITE ");
  console.log("============================================================\n");

  const conn = await connectDB();
  if (!conn || mongoose.connection.readyState !== 1) {
    logger.warn("⚠️ Database connection not active. Skipping live DB requests, running route syntax suite.");
  } else {
    logger.info("Connected to MongoDB Atlas for integration testing.");
  }

  // Start HTTP Server on ephemeral port
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  logger.info(`Test server listening on ${baseUrl}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  };

  function assert(name, condition, details = "") {
    results.total++;
    if (condition) {
      results.passed++;
      results.tests.push({ name, status: "PASS", details });
      console.log(`  ✅ PASS: ${name}`);
    } else {
      results.failed++;
      results.tests.push({ name, status: "FAIL", details });
      console.log(`  ❌ FAIL: ${name} ${details ? `(${details})` : ""}`);
    }
  }

  try {
    const timestamp = Date.now();
    const adminEmail = `admin_${timestamp}@test.com`;
    const salesEmail = `sales_${timestamp}@test.com`;
    const phoneAdmin = `+919000${timestamp.toString().slice(-6)}`;
    const phoneSales = `+919100${timestamp.toString().slice(-6)}`;
    const leadPhone1 = `+919800${timestamp.toString().slice(-6)}`;
    const leadPhone2 = `+919811${timestamp.toString().slice(-6)}`;

    let adminToken, salesToken, adminId, salesId, testLeadId;

    // ── 1. AUTHENTICATION & REGISTRATION ──
    console.log("\n--- [1] Authentication & User Registration ---");

    // Register Admin
    const regAdminRes = await request("POST", "/api/v1/auth/register", {
      name: "Test Admin",
      email: adminEmail,
      phone: phoneAdmin,
      password: "AdminPassword123!",
      role: "admin",
    });
    assert("Admin User Registration", regAdminRes.status === 201 && regAdminRes.body.success);
    adminToken = regAdminRes.body?.data?.accessToken;
    adminId = regAdminRes.body?.data?.user?._id;

    // Register Salesperson
    const regSalesRes = await request("POST", "/api/v1/auth/register", {
      name: "Test Salesperson",
      email: salesEmail,
      phone: phoneSales,
      password: "SalesPassword123!",
      role: "salesperson",
    });
    assert("Salesperson User Registration", regSalesRes.status === 201 && regSalesRes.body.success);
    salesToken = regSalesRes.body?.data?.accessToken;
    salesId = regSalesRes.body?.data?.user?._id;

    // Email/Password Login
    const loginRes = await request("POST", "/api/v1/auth/login", {
      email: adminEmail,
      password: "AdminPassword123!",
    });
    assert("Admin Login with Valid Credentials", loginRes.status === 200 && loginRes.body.data.accessToken);

    // Invalid Login Credentials
    const invalidLoginRes = await request("POST", "/api/v1/auth/login", {
      email: adminEmail,
      password: "WrongPassword!",
    });
    assert("Reject Login with Invalid Password", invalidLoginRes.status === 401);

    // OTP Send & Verify
    const sendOtpRes = await request("POST", "/api/v1/auth/send-otp", { phone: phoneAdmin });
    assert("Send OTP Endpoint", sendOtpRes.status === 200 && sendOtpRes.body.success);

    // OTP Cooldown Enforcement
    const resendOtpRes = await request("POST", "/api/v1/auth/send-otp", { phone: phoneAdmin });
    assert("Enforce 60s Resend Cooldown (HTTP 429)", resendOtpRes.status === 429);

    // Get Logged In User Profile (/me)
    const meRes = await request("GET", "/api/v1/auth/me", null, adminToken);
    assert("Fetch Logged-In User Profile (/me)", meRes.status === 200 && meRes.body.data.email === adminEmail);

    // ── 2. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS ──
    console.log("\n--- [2] RBAC & Authorization Scoping ---");

    // Unauthenticated Access Rejection
    const unauthRes = await request("GET", "/api/v1/users");
    assert("Reject Unauthenticated Access (HTTP 401)", unauthRes.status === 401);

    // Salesperson Forbidden from Admin Users Endpoint
    const salesUsersRes = await request("GET", "/api/v1/users", null, salesToken);
    assert("Restrict Salesperson from User Management (HTTP 403)", salesUsersRes.status === 403);

    // Salesperson Forbidden from Reports Endpoint
    const salesReportsRes = await request("GET", "/api/v1/reports", null, salesToken);
    assert("Restrict Salesperson from Analytics Reports (HTTP 403)", salesReportsRes.status === 403);

    // Admin Access to Reports Allowed
    const adminReportsRes = await request("GET", "/api/v1/reports", null, adminToken);
    assert("Allow Admin Access to Analytics Reports (HTTP 200)", adminReportsRes.status === 200);

    // ── 3. MASTER DATA SETUP ──
    console.log("\n--- [3] Master Data (Sources, Pipeline, Products) ---");

    // Fetch or create default Lead Source
    const sourcesRes = await request("GET", "/api/v1/sources", null, adminToken);
    assert("Fetch Lead Sources List", sourcesRes.status === 200);
    const sourceId = sourcesRes.body.data[0]?._id;

    // Fetch or create default Pipeline Stage
    const stagesRes = await request("GET", "/api/v1/pipeline/stages", null, adminToken);
    assert("Fetch Pipeline Stages List", stagesRes.status === 200);
    const stageId = stagesRes.body.data[0]?._id;

    // Create Product (Admin)
    const createProdRes = await request(
      "POST",
      "/api/v1/products",
      { name: `Service Plan ${timestamp}`, price: 15000, category: "Software" },
      adminToken
    );
    assert("Create Product/Service Asset", createProdRes.status === 201 && createProdRes.body.success);
    const productId = createProdRes.body.data._id;

    // ── 4. LEAD MANAGEMENT ──
    console.log("\n--- [4] Lead Lifecycle & CRUD ---");

    // Create Lead (Admin)
    const createLeadRes = await request(
      "POST",
      "/api/v1/leads",
      {
        name: "Enterprise Client",
        company: "Acme Software Inc",
        email: `lead_${timestamp}@acme.com`,
        phone: leadPhone1,
        sourceId,
        stageId,
        status: "New",
        estimatedValue: 75000,
        products: [productId],
      },
      adminToken
    );
    assert("Create Lead (Admin)", createLeadRes.status === 201 && createLeadRes.body.data.customLeadId);
    testLeadId = createLeadRes.body.data._id;

    // Duplicate Lead Phone Number Rejection
    const dupLeadRes = await request(
      "POST",
      "/api/v1/leads",
      {
        name: "Duplicate Client",
        phone: leadPhone1,
        sourceId,
        stageId,
      },
      adminToken
    );
    assert("Reject Duplicate Lead Phone (HTTP 400)", dupLeadRes.status === 400);

    // Create Lead (Salesperson) -> Auto assigned
    const salesLeadRes = await request(
      "POST",
      "/api/v1/leads",
      {
        name: "Direct Sales Lead",
        phone: leadPhone2,
        sourceId,
        stageId,
      },
      salesToken
    );
    assert("Salesperson Create Lead (Auto-Assigned)", salesLeadRes.status === 201 && salesLeadRes.body.data.assignedTo?._id === salesId);
    const salesLeadId = salesLeadRes.body.data._id;

    // Get Leads List with Pagination
    const listLeadsRes = await request("GET", "/api/v1/leads?page=1&limit=10", null, adminToken);
    assert("Fetch Leads List with Pagination Metadata", listLeadsRes.status === 200 && listLeadsRes.body.data.pagination.page === 1);

    // Lead Search ($text index)
    const searchLeadsRes = await request("GET", "/api/v1/leads?search=Enterprise", null, adminToken);
    assert("Lead Full-Text Search Query", searchLeadsRes.status === 200 && searchLeadsRes.body.data.leads.length >= 1);

    // Resource Ownership Check (Salesperson accessing unassigned lead)
    const unauthLeadAccess = await request("GET", `/api/v1/leads/${testLeadId}`, null, salesToken);
    assert("Restrict Salesperson from Viewing Unassigned Lead (HTTP 403)", unauthLeadAccess.status === 403);

    // Update Lead Status (Admin)
    const updateLeadRes = await request(
      "PATCH",
      `/api/v1/leads/${testLeadId}`,
      { status: "Contacted", notes: "First intro call completed" },
      adminToken
    );
    assert("Update Lead Profile & Audit Status Change", updateLeadRes.status === 200 && updateLeadRes.body.data.status === "Contacted");

    // Assign Lead to Salesperson
    const assignRes = await request("PATCH", `/api/v1/leads/${testLeadId}/assign`, { assignedTo: salesId }, adminToken);
    assert("Assign Lead to Salesperson", assignRes.status === 200 && assignRes.body.data.assignedTo?._id === salesId);

    // Now Salesperson CAN access the assigned lead
    const salesAssignedAccess = await request("GET", `/api/v1/leads/${testLeadId}`, null, salesToken);
    assert("Allow Salesperson Access to Newly Assigned Lead", salesAssignedAccess.status === 200 && salesAssignedAccess.body.data.lead._id === testLeadId);

    // ── 5. FOLLOW-UPS, TASKS & CALENDAR ──
    console.log("\n--- [5] Follow-ups, Tasks & Derived Calendar ---");

    // Create Follow-up
    const createFollowupRes = await request(
      "POST",
      "/api/v1/followups",
      {
        leadId: testLeadId,
        type: "Call",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        notes: "Schedule demo presentation",
      },
      salesToken
    );
    assert("Schedule Follow-up for Lead", createFollowupRes.status === 201 && createFollowupRes.body.success);
    const followupId = createFollowupRes.body.data._id;

    // Complete Follow-up
    const completeFollowupRes = await request("PATCH", `/api/v1/followups/${followupId}/complete`, { notes: "Demo completed successfully" }, salesToken);
    assert("Mark Follow-up as Completed", completeFollowupRes.status === 200 && completeFollowupRes.body.data.status === "Completed");

    // Create Task
    const createTaskRes = await request(
      "POST",
      "/api/v1/tasks",
      {
        title: "Prepare Proposal",
        description: "Draft commercial quote",
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        priority: "High",
        leadId: testLeadId,
      },
      salesToken
    );
    assert("Create Task for Lead", createTaskRes.status === 201 && createTaskRes.body.success);

    // Calendar Feed (Derived dynamically)
    const calRes = await request("GET", "/api/v1/calendar?view=monthly", null, salesToken);
    assert("Fetch Derived Monthly Calendar Feed", calRes.status === 200 && calRes.body.data.events.length >= 1);

    // ── 6. DASHBOARD, REPORTS & ANALYTICS ──
    console.log("\n--- [6] Dashboard Metrics & Aggregation Reports ---");

    // Dashboard Stats (Admin)
    const adminDashRes = await request("GET", "/api/v1/dashboard/stats", null, adminToken);
    assert("Fetch Admin Dashboard KPI Aggregations", adminDashRes.status === 200 && adminDashRes.body.data.kpi.totalLeads >= 2);

    // Dashboard Stats (Salesperson - scoped)
    const salesDashRes = await request("GET", "/api/v1/dashboard/stats", null, salesToken);
    assert("Fetch Salesperson-Scoped Dashboard KPIs", salesDashRes.status === 200 && salesDashRes.body.data.kpi);

    // Individual Analytics Reports (Admin)
    const reportSummary = await request("GET", "/api/v1/reports/summary", null, adminToken);
    assert("GET /api/v1/reports/summary", reportSummary.status === 200);

    const reportTrend = await request("GET", "/api/v1/reports/trend", null, adminToken);
    assert("GET /api/v1/reports/trend", reportTrend.status === 200);

    const reportSources = await request("GET", "/api/v1/reports/sources", null, adminToken);
    assert("GET /api/v1/reports/sources", reportSources.status === 200);

    const reportSalespersons = await request("GET", "/api/v1/reports/salespersons", null, adminToken);
    assert("GET /api/v1/reports/salespersons", reportSalespersons.status === 200);

    // ── 7. IMPORT / EXPORT ──
    console.log("\n--- [7] Import & Export APIs ---");

    // CSV Template Download
    const templateRes = await request("GET", "/api/v1/import-export/template", null, adminToken);
    assert("Download Import CSV Template", templateRes.status === 200 && templateRes.headers["content-type"].includes("csv"));

    // CSV Export
    const csvExportRes = await request("GET", "/api/v1/import-export/export/csv", null, adminToken);
    assert("Export Filtered Leads as CSV", csvExportRes.status === 200 && csvExportRes.headers["content-type"].includes("csv"));

    // XLSX Export
    const xlsxExportRes = await request("GET", "/api/v1/import-export/export/xlsx", null, adminToken);
    assert("Export Filtered Leads as XLSX", xlsxExportRes.status === 200);

    // ── 8. ACTIVITY TIMELINE & AUDIT LOGS ──
    console.log("\n--- [8] Activity History & System Audit Logs ---");

    // Lead Activity Timeline
    const leadActRes = await request("GET", `/api/v1/leads/${testLeadId}/activities`, null, adminToken);
    assert("Fetch Lead Activity Timeline", leadActRes.status === 200 && leadActRes.body.data.activities.length >= 1);

    // System Audit Logs (Admin)
    const auditLogsRes = await request("GET", "/api/v1/audit-logs", null, adminToken);
    assert("Fetch System Audit Logs (Admin)", auditLogsRes.status === 200);

    // Salesperson Forbidden from Audit Logs
    const salesAuditRes = await request("GET", "/api/v1/audit-logs", null, salesToken);
    assert("Restrict Salesperson from System Audit Logs (HTTP 403)", salesAuditRes.status === 403);

    console.log("\n============================================================");
    console.log(` 📊 SUMMARY: ${results.passed} / ${results.total} TESTS PASSED (${results.failed} FAILED)`);
    console.log("============================================================\n");
  } catch (err) {
    console.error("❌ Execution Error during testing:", err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runFullSuite();
