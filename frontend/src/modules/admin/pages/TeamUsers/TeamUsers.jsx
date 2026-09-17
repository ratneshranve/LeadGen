import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { UserPlus, Download, Users } from "lucide-react";
import { TeamSummaryCards } from "./components/TeamSummaryCards";
import { UserDirectoryToolbar } from "./components/UserDirectoryToolbar";
import { UserDirectoryTable } from "./components/UserDirectoryTable";
import { AddEditUserModal } from "./components/AddEditUserModal";
import { AddSalesEmployeeModal } from "./components/AddSalesEmployeeModal";
import { UpdateSalesEmployeeModal } from "./components/UpdateSalesEmployeeModal";
import { DeactivateUserModal } from "./components/DeactivateUserModal";
import { ReassignUserLeadsModal } from "./components/ReassignUserLeadsModal";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { LeadsPagination } from "../Leads/components/LeadsPagination";
import { Modal } from "../../../../components/ui/Modal";
import "./TeamUsers.css";

export const TeamUsers = ({ forceOpenAddModal = false, forceOpenUpdateModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialUsers = [
    {
      id: "u-0",
      name: "Rajesh Kumar",
      email: "rajesh@leadflow.com",
      phone: "+91 98765 00000",
      dob: "1990-01-15",
      role: "Admin",
      status: "Active",
      assignedLeads: 0,
      activeLeads: 0,
      followups: 0,
      converted: 0,
      maxCapacity: 50,
      createdAt: "Jan 10, 2026",
      lastActive: "Today",
    },
    {
      id: "u-1",
      name: "Amit Sharma",
      email: "amit@leadflow.com",
      phone: "+91 98765 11111",
      dob: "1994-05-12",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 12,
      activeLeads: 8,
      followups: 3,
      converted: 4,
      maxCapacity: 50,
      createdAt: "Feb 14, 2026",
      lastActive: "Today",
    },
    {
      id: "u-2",
      name: "Neha Verma",
      email: "neha@leadflow.com",
      phone: "+91 98765 22222",
      dob: "1996-08-23",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 8,
      activeLeads: 5,
      followups: 2,
      converted: 3,
      maxCapacity: 50,
      createdAt: "Feb 18, 2026",
      lastActive: "Today",
    },
    {
      id: "u-3",
      name: "Rahul Mehta",
      email: "rahul@leadflow.com",
      phone: "+91 98765 33333",
      dob: "1993-11-04",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 6,
      activeLeads: 4,
      followups: 2,
      converted: 2,
      maxCapacity: 50,
      createdAt: "Mar 02, 2026",
      lastActive: "Today",
    },
    {
      id: "u-4",
      name: "Priya Singh",
      email: "priya@leadflow.com",
      phone: "+91 98765 44444",
      dob: "1995-02-18",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 5,
      activeLeads: 3,
      followups: 1,
      converted: 1,
      maxCapacity: 50,
      createdAt: "Mar 15, 2026",
      lastActive: "Yesterday",
    },
  ];

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("leadflow_mock_team_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          return parsed.map((u) => ({
            ...u,
            dob: u.dob || "1995-08-15",
            role: (u.role === "Master Admin" || u.role === "Admin") ? "Admin" : "Sales Employee"
          }));
        }
      } catch (e) {}
    }
    return initialUsers;
  });

  // Sync users with localStorage
  useEffect(() => {
    localStorage.setItem("leadflow_mock_team_users", JSON.stringify(users));
  }, [users]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest First");
  const [dobFilter, setDobFilter] = useState("");

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // null | "addEdit" | "deactivate" | "reassign" | "viewDrawer" | "singleDelete" | "bulkDelete"
  const [targetUser, setTargetUser] = useState(null);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(forceOpenAddModal);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(forceOpenUpdateModal);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Deep Link Route Sync for /admin/sales-employees/add & /admin/sales-employees/update
  useEffect(() => {
    if (location.pathname === "/admin/sales-employees/add" || forceOpenAddModal) {
      setIsAddModalOpen(true);
    }
  }, [location.pathname, forceOpenAddModal]);

  useEffect(() => {
    if (location.pathname === "/admin/sales-employees/update" || forceOpenUpdateModal) {
      const userId = searchParams.get("id");
      if (userId) {
        const found = users.find((u) => u.id === userId);
        if (found) setUserToUpdate(found);
      } else if (users.length > 0 && !userToUpdate) {
        setUserToUpdate(users.find((u) => u.role !== "Admin") || users[0]);
      }
      setIsUpdateModalOpen(true);
    }
  }, [location.pathname, searchParams, forceOpenUpdateModal]);

  // Filter out Admin accounts - ONLY Sales Employees belong to Sales Directory
  const salesPersonsList = useMemo(() => {
    return users.filter((u) => u.role !== "Admin" && u.role !== "Master Admin");
  }, [users]);

  // Calculate Summary Stats
  const totalUsersCount = salesPersonsList.length;
  const activeUsersCount = salesPersonsList.filter((u) => u.status === "Active").length;
  const totalAssignedLeads = salesPersonsList.reduce((acc, u) => acc + (u.assignedLeads || 0), 0);
  const totalConvertedDeals = salesPersonsList.reduce((acc, u) => acc + (u.converted || 0), 0);

  // Filtered & Sorted Users List
  const filteredUsers = useMemo(() => {
    return salesPersonsList
      .filter((u) => {
        const query = searchQuery.toLowerCase().trim();
        if (query) {
          const matchName = u.name.toLowerCase().includes(query);
          const matchEmail = u.email.toLowerCase().includes(query);
          const matchPhone = u.phone ? u.phone.toLowerCase().includes(query) : false;
          if (!matchName && !matchEmail && !matchPhone) return false;
        }
        if (selectedStatus !== "All" && u.status !== selectedStatus) return false;
        if (dobFilter && u.dob !== dobFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "Name A-Z") return a.name.localeCompare(b.name);
        if (selectedSort === "Name Z-A") return b.name.localeCompare(a.name);
        return 0;
      });
  }, [salesPersonsList, searchQuery, selectedStatus, selectedSort, dobFilter]);

  // Paginated Subset
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Checkbox Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedUsers.length > 0 && selectedIds.length === paginatedUsers.length;

  const handleOpenAddUser = () => {
    setIsAddModalOpen(true);
    if (location.pathname !== "/admin/sales-employees/add") {
      navigate("/admin/sales-employees/add");
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (location.pathname === "/admin/sales-employees/add") {
      navigate("/admin/sales-employees");
    }
  };

  const handleCreateSalesEmployee = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    setToastMessage(`Sales employee '${newUser.name}' created successfully!`);
    setIsToastOpen(true);
    handleCloseAddModal();
  };

  const handleOpenEditUser = (userToEdit) => {
    setUserToUpdate(userToEdit);
    setIsUpdateModalOpen(true);
    navigate(`/admin/sales-employees/update?id=${userToEdit.id}`);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setUserToUpdate(null);
    if (location.pathname === "/admin/sales-employees/update") {
      navigate("/admin/sales-employees");
    }
  };

  const handleUpdateUserSubmit = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : l === u ? updatedUser : { ...u, ...updatedUser })));
    setToastMessage(`Sales employee '${updatedUser.name}' updated successfully!`);
    setIsToastOpen(true);
    handleCloseUpdateModal();
  };

  const handleOpenViewDrawer = (userToView) => {
    setTargetUser(userToView);
    setActiveModal("viewDrawer");
  };

  const handlePromptDeleteUser = (userToDelete) => {
    setTargetUser(userToDelete);
    setActiveModal("singleDelete");
  };

  const handleConfirmSingleDelete = () => {
    if (targetUser) {
      const updated = users.filter((u) => u.id !== targetUser.id);
      setUsers(updated);
      setSelectedIds((prev) => prev.filter((id) => id !== targetUser.id));
      setToastMessage(`Sales employee '${targetUser.name}' deleted successfully!`);
      setIsToastOpen(true);
      setTargetUser(null);
      setActiveModal(null);
    }
  };

  const handleConfirmBulkDelete = () => {
    const deletedCount = selectedIds.length;
    const updated = users.filter((u) => !selectedIds.includes(u.id));
    setUsers(updated);
    setSelectedIds([]);
    setActiveModal(null);
    setToastMessage(`${deletedCount} sales employee(s) deleted successfully!`);
    setIsToastOpen(true);
  };

  const handleConfirmSaveUser = (formData) => {
    const newUser = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "+91 98765 00000",
      dob: formData.dob || "1995-08-15",
      role: formData.role || "Sales Employee",
      status: formData.status || "Active",
      assignedLeads: 0,
      activeLeads: 0,
      followups: 0,
      converted: 0,
      maxCapacity: formData.maxCapacity || 50,
      createdAt: "Sep 01, 2026",
      lastActive: "Just now",
    };
    setUsers((prev) => [newUser, ...prev]);
    setToastMessage(`Sales employee '${formData.name}' created successfully`);
    setIsToastOpen(true);
    setActiveModal(null);
    setTargetUser(null);
  };

  return (
    <div className="team-users-page">
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Add Sales Employee Overlay Card Modal */}
      <AddSalesEmployeeModal
        isOpen={isAddModalOpen || forceOpenAddModal || location.pathname === "/admin/sales-employees/add"}
        onClose={handleCloseAddModal}
        onAddUser={handleCreateSalesEmployee}
      />

      {/* Update Sales Employee Overlay Card Modal */}
      <UpdateSalesEmployeeModal
        isOpen={isUpdateModalOpen || forceOpenUpdateModal || location.pathname === "/admin/sales-employees/update"}
        onClose={handleCloseUpdateModal}
        targetUser={userToUpdate || targetUser || salesPersonsList[0]}
        onUpdateUser={handleUpdateUserSubmit}
      />

      {/* Interactive Sales User Profile Drawer Card */}
      <ProfileEditCardModal
        isOpen={activeModal === "viewDrawer" && targetUser !== null}
        onClose={() => {
          setActiveModal(null);
          setTargetUser(null);
        }}
        data={targetUser}
        type="user"
        onSave={(updatedUser) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
          );
          setActiveModal(null);
          setTargetUser(null);
        }}
        onDelete={(userToDelete) => {
          setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
          setActiveModal(null);
          setTargetUser(null);
        }}
      />

      {/* Single Sales Employee Delete Confirmation Modal */}
      <Modal
        isOpen={activeModal === "singleDelete" && targetUser !== null}
        onClose={() => setActiveModal(null)}
        title="Confirm Delete Sales Employee"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "#1b2559", lineHeight: "1.5" }}>
            Are you sure you want to delete sales employee <strong>{targetUser?.name}</strong> ({targetUser?.email})? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c" }} onClick={handleConfirmSingleDelete}>
              Yes (Delete)
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Sales Employees Confirmation Modal */}
      <Modal
        isOpen={activeModal === "bulkDelete"}
        onClose={() => setActiveModal(null)}
        title="Confirm Delete"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "#1b2559", lineHeight: "1.5" }}>
            Are you sure you want to delete all <strong>{selectedIds.length}</strong> selected sales employees? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c" }} onClick={handleConfirmBulkDelete}>
              Yes (Delete)
            </button>
          </div>
        </div>
      </Modal>

      {/* Header Banner - Matches Leads Page Format */}
      <div className="crm-card leads-page-header">
        <div className="header-text-container">
          <h1 className="page-heading">Sales Employees</h1>
          <p className="page-subheading">
            Manage and track all your sales employee accounts in one place.
          </p>
        </div>

        <button
          className="crm-btn crm-btn-primary add-lead-btn"
          onClick={handleOpenAddUser}
        >
          <UserPlus size={16} /> Add Sales Employee
        </button>
      </div>

      {/* 4 Summary Metrics Cards */}
      <TeamSummaryCards
        stats={{
          total: totalUsersCount,
          active: activeUsersCount,
          assignedLeads: totalAssignedLeads || 31,
          convertedDeals: totalConvertedDeals || 10,
        }}
      />

      {/* Search & Filters Toolbar */}
      <UserDirectoryToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        dobFilter={dobFilter}
        setDobFilter={setDobFilter}
        onResetFilters={() => {
          setSearchQuery("");
          setSelectedRole("All");
          setSelectedStatus("All");
          setSelectedSort("Newest First");
          setDobFilter("");
        }}
        selectedCount={selectedIds.length}
        onBulkDelete={() => setActiveModal("bulkDelete")}
      />

      {/* Main Table Card */}
      <div className="crm-card leads-table-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden" }}>
        <UserDirectoryTable
          users={paginatedUsers}
          selectedUserIds={selectedIds}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          onEditUser={handleOpenEditUser}
          onDeleteUser={handlePromptDeleteUser}
          onViewUserCard={handleOpenViewDrawer}
        />

        <LeadsPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalItems={filteredUsers.length}
        />
      </div>
    </div>
  );
};
