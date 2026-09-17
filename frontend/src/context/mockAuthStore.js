// Pure Frontend Local User Store
const INITIAL_USERS = [
  {
    id: "usr-admin-1",
    name: "Rajesh Kumar",
    email: "admin@leadflow.com",
    mobile: "+91 98765 00001",
    password: "Admin#Pass2026!",
    role: "MASTER_ADMIN",
    status: "ACTIVE",
    createdAt: "Jan 01, 2026",
  },
  {
    id: "usr-sales-1",
    name: "Amit Sharma",
    email: "amit@leadflow.com",
    mobile: "+91 98765 11111",
    password: "Sales#Pass2026!",
    role: "SALES_REPRESENTATIVE",
    status: "ACTIVE",
    createdAt: "Jan 10, 2026",
  },
  {
    id: "usr-sales-2",
    name: "Neha Verma",
    email: "neha@leadflow.com",
    mobile: "+91 98765 22222",
    password: "Sales#Pass2026!",
    role: "SALES_REPRESENTATIVE",
    status: "ACTIVE",
    createdAt: "Jan 15, 2026",
  },
  {
    id: "usr-sales-3",
    name: "Rahul Mehta",
    email: "rahul@leadflow.com",
    mobile: "+91 98765 33333",
    password: "Sales#Pass2026!",
    role: "SALES_REPRESENTATIVE",
    status: "ACTIVE",
    createdAt: "Jan 20, 2026",
  },
  {
    id: "usr-sales-4",
    name: "Priya Singh",
    email: "priya@leadflow.com",
    mobile: "+91 98765 44444",
    password: "Sales#Pass2026!",
    role: "SALES_REPRESENTATIVE",
    status: "ACTIVE",
    createdAt: "Jan 25, 2026",
  },
];

export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem("leadflow_mock_users");
    if (data) {
      const users = JSON.parse(data);
      let updated = false;
      // Auto-migrate weak breached default passwords to clean secure passwords
      const cleaned = users.map((u) => {
        if (u.password === "Admin@123") {
          updated = true;
          return { ...u, password: "Admin#Pass2026!" };
        }
        if (u.password === "Sales@123") {
          updated = true;
          return { ...u, password: "Sales#Pass2026!" };
        }
        return u;
      });
      if (updated) {
        localStorage.setItem("leadflow_mock_users", JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (e) {}
  localStorage.setItem("leadflow_mock_users", JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const saveStoredUsers = (users) => {
  localStorage.setItem("leadflow_mock_users", JSON.stringify(users));
};

export const mockAuthenticate = (email, password) => {
  const users = getStoredUsers();
  const cleanEmail = email.toLowerCase().trim();
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    throw new Error("Invalid email or password.");
  }

  // Check against the user's current password
  // (Only support initial demo password if user hasn't changed it yet)
  const isDefaultUnchangedAccount =
    (found.email.toLowerCase() === "admin@leadflow.com" && found.password === "Admin#Pass2026!") ||
    (found.email.toLowerCase().includes("@leadflow.com") && found.password === "Sales#Pass2026!");

  const isValidPass =
    found.password === password ||
    (isDefaultUnchangedAccount && (password === "Admin@123" || password === "Sales@123"));

  if (!isValidPass) {
    throw new Error("Invalid email or password.");
  }

  if (found.status !== "ACTIVE") {
    throw new Error("Your account is inactive. Please contact your administrator.");
  }

  const { password: _, ...safeUser } = found;
  return safeUser;
};

export const mockRegisterSalesperson = (userData) => {
  const users = getStoredUsers();
  const cleanEmail = userData.email.toLowerCase().trim();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error("User with this email already exists");
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: userData.name,
    email: cleanEmail,
    mobile: userData.mobile || "",
    password: userData.password || "Sales#Pass2026!",
    role: userData.role || "SALES_REPRESENTATIVE",
    status: userData.status || "ACTIVE",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
  };

  users.unshift(newUser);
  saveStoredUsers(users);

  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const mockUpdateUserProfile = (userId, updatedFields) => {
  const users = getStoredUsers();

  const index = users.findIndex(
    (u) =>
      u.id === userId ||
      (updatedFields.currentEmail && u.email.toLowerCase() === updatedFields.currentEmail.toLowerCase())
  );

  if (index === -1) {
    throw new Error("User record not found in system.");
  }

  // Check email uniqueness if changing email
  if (updatedFields.email) {
    const newEmail = updatedFields.email.toLowerCase().trim();
    const existing = users.find((u, idx) => idx !== index && u.email.toLowerCase() === newEmail);
    if (existing) {
      throw new Error("This email address is already in use by another account.");
    }
    users[index].email = newEmail;
  }

  if (updatedFields.name) users[index].name = updatedFields.name;
  if (updatedFields.mobile !== undefined) users[index].mobile = updatedFields.mobile;

  // Update password if provided and non-empty
  if (updatedFields.password && updatedFields.password.trim()) {
    users[index].password = updatedFields.password.trim();
  }

  saveStoredUsers(users);

  // Sync updated profile with leadflow_mock_team_users
  try {
    const savedTeamUsers = localStorage.getItem("leadflow_mock_team_users");
    if (savedTeamUsers) {
      const parsedTeam = JSON.parse(savedTeamUsers);
      const teamIdx = parsedTeam.findIndex(
        (u) => u.id === userId || u.email?.toLowerCase() === users[index].email.toLowerCase() || u.name === users[index].name
      );
      if (teamIdx !== -1) {
        parsedTeam[teamIdx].name = users[index].name;
        parsedTeam[teamIdx].email = users[index].email;
        if (updatedFields.mobile) parsedTeam[teamIdx].phone = updatedFields.mobile;
        localStorage.setItem("leadflow_mock_team_users", JSON.stringify(parsedTeam));
      }
    }
  } catch (e) {}

  const { password: _, ...safeUser } = users[index];
  return safeUser;
};
