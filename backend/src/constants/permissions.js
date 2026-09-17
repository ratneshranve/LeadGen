/**
 * Centralized Permission Definitions Matrix for RBAC
 */
const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW_GLOBAL: "dashboard:view:global",
  DASHBOARD_VIEW_SCOPED: "dashboard:view:scoped",

  // Leads
  LEADS_CREATE: "leads:create",
  LEADS_READ_ALL: "leads:read:all",
  LEADS_READ_OWN: "leads:read:own",
  LEADS_UPDATE_ALL: "leads:update:all",
  LEADS_UPDATE_OWN: "leads:update:own",
  LEADS_DELETE: "leads:delete",
  LEADS_BULK_ACTION: "leads:bulk",

  // Lead Assignment
  LEADS_ASSIGN: "leads:assign",
  LEADS_REASSIGN: "leads:reassign",

  // Pipeline
  PIPELINE_VIEW: "pipeline:view",
  PIPELINE_MANAGE_STAGES: "pipeline:manage_stages",
  PIPELINE_MOVE_STAGE_OWN: "pipeline:move_stage:own",
  PIPELINE_MOVE_STAGE_ALL: "pipeline:move_stage:all",

  // Sources
  SOURCES_VIEW: "sources:view",
  SOURCES_MANAGE: "sources:manage",

  // Follow-ups
  FOLLOWUPS_CREATE: "followups:create",
  FOLLOWUPS_READ_ALL: "followups:read:all",
  FOLLOWUPS_READ_OWN: "followups:read:own",
  FOLLOWUPS_COMPLETE_OWN: "followups:complete:own",
  FOLLOWUPS_DELETE: "followups:delete",

  // Tasks
  TASKS_CREATE: "tasks:create",
  TASKS_READ_ALL: "tasks:read:all",
  TASKS_READ_OWN: "tasks:read:own",
  TASKS_UPDATE_OWN: "tasks:update:own",
  TASKS_DELETE: "tasks:delete",

  // Calendar
  CALENDAR_VIEW_GLOBAL: "calendar:view:global",
  CALENDAR_VIEW_SCOPED: "calendar:view:scoped",

  // Products & Services
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",

  // Users & Team Management
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_TOGGLE_STATUS: "users:toggle_status",
  USERS_DELETE: "users:delete",

  // Reports & Analytics
  REPORTS_VIEW_GLOBAL: "reports:view:global",
  REPORTS_VIEW_SCOPED: "reports:view:scoped",

  // Import / Export
  DATA_EXPORT: "data:export",
  DATA_IMPORT: "data:import",

  // Activity History
  ACTIVITY_READ_ALL: "activity:read:all",
  ACTIVITY_READ_OWN: "activity:read:own",

  // Notifications
  NOTIFICATIONS_READ_OWN: "notifications:read:own",
  NOTIFICATIONS_READ_ALL: "notifications:read:all",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
};

/**
 * Role-Permission Default Mappings
 */
const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS), // Admin has ALL permissions
  salesperson: [
    PERMISSIONS.DASHBOARD_VIEW_SCOPED,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_READ_OWN,
    PERMISSIONS.LEADS_UPDATE_OWN,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.PIPELINE_MOVE_STAGE_OWN,
    PERMISSIONS.SOURCES_VIEW,
    PERMISSIONS.FOLLOWUPS_CREATE,
    PERMISSIONS.FOLLOWUPS_READ_OWN,
    PERMISSIONS.FOLLOWUPS_COMPLETE_OWN,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ_OWN,
    PERMISSIONS.TASKS_UPDATE_OWN,
    PERMISSIONS.CALENDAR_VIEW_SCOPED,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.ACTIVITY_READ_OWN,
    PERMISSIONS.NOTIFICATIONS_READ_OWN,
  ],
  manager: [
    PERMISSIONS.DASHBOARD_VIEW_GLOBAL,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_READ_ALL,
    PERMISSIONS.LEADS_UPDATE_ALL,
    PERMISSIONS.LEADS_ASSIGN,
    PERMISSIONS.LEADS_REASSIGN,
    PERMISSIONS.PIPELINE_VIEW,
    PERMISSIONS.PIPELINE_MOVE_STAGE_ALL,
    PERMISSIONS.SOURCES_VIEW,
    PERMISSIONS.FOLLOWUPS_CREATE,
    PERMISSIONS.FOLLOWUPS_READ_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ_ALL,
    PERMISSIONS.CALENDAR_VIEW_GLOBAL,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.REPORTS_VIEW_GLOBAL,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.ACTIVITY_READ_ALL,
    PERMISSIONS.NOTIFICATIONS_READ_ALL,
  ],
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
};
