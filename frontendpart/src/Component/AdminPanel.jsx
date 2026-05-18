import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { API_URL } from "../config/api";

const BASE_URL = `${API_URL}/api`;

export default function AdminPanel() {
  const adminName = "Admin Harshit";
  const [users, setUsers] = useState([]);

  // 🔐 API helper
  const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const res = await fetch(BASE_URL + endpoint, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: options.body ? JSON.stringify(options.body) : null
    });

    return res.json();
  };

  // 📥 Fetch users + invoice count
  const loadUsers = async () => {
    const data = await api("/admin/invoice-count");
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 🚫 Block / Unblock user
  const toggleBlock = async (id) => {
    await api(`/admin/block-user/${id}`, { method: "PUT" });
    loadUsers();
  };

  // ❌ Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api(`/admin/delete-user/${id}`, { method: "DELETE" });
    loadUsers();
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>

        <div style={styles.headerRight}>
          <span style={styles.adminName}>{adminName}</span>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main style={styles.container}>
        {/* CHART */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Invoices Per User</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={users}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="invoiceCount" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* TABLE */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>User Management</h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Invoices</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={
                        u.role === "admin"
                          ? styles.roleAdmin
                          : styles.roleUser
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{u.invoiceCount}</td>
                  <td>
                    <span
                      style={
                        u.isBlocked
                          ? styles.statusWait
                          : styles.statusActive
                      }
                    >
                      {u.isBlocked ? "WAIT" : "ACTIVE"}
                    </span>
                  </td>
                  <td>
                    <button
                      style={styles.waitBtn}
                      onClick={() => toggleBlock(u._id)}
                      onMouseOver={(e) =>
                        Object.assign(e.target.style, styles.waitBtnHover)
                      }
                      onMouseOut={(e) =>
                        Object.assign(e.target.style, styles.waitBtn)
                      }
                    >
                      ⏸ {u.isBlocked ? "Unwait" : "Put Wait"}
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteUser(u._id)}
                      onMouseOver={(e) =>
                        Object.assign(e.target.style, styles.deleteBtnHover)
                      }
                      onMouseOut={(e) =>
                        Object.assign(e.target.style, styles.deleteBtn)
                      }
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

/* 🎨 STYLES (UNCHANGED) */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "Inter, Segoe UI, sans-serif"
  },
  header: {
    background: "linear-gradient(90deg,#1e293b,#0f172a)",
    padding: "20px 44px",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 18
  },
  adminName: {
    background: "#334155",
    padding: "8px 20px",
    borderRadius: 999,
    fontSize: 14
  },
  logoutBtn: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    padding: "8px 20px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600
  },
  container: {
    padding: "48px",
    display: "grid",
    gap: 44
  },
  card: {
    background: "#ffffff",
    padding: "34px",
    borderRadius: 22,
    boxShadow: "0 22px 45px rgba(0,0,0,0.08)"
  },
  cardTitle: {
    marginBottom: 26
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  roleAdmin: {
    color: "#7c3aed",
    fontWeight: 700
  },
  roleUser: {
    color: "#2563eb",
    fontWeight: 600
  },
  statusActive: {
    color: "#16a34a",
    fontWeight: 700
  },
  statusWait: {
    color: "#f59e0b",
    fontWeight: 700
  },
  waitBtn: {
    marginRight: 12,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(245,158,11,0.35)",
    transition: "all 0.25s ease"
  },
  waitBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 16px 35px rgba(245,158,11,0.5)"
  },
  deleteBtn: {
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg,#f87171,#ef4444)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(239,68,68,0.35)",
    transition: "all 0.25s ease"
  },
  deleteBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 16px 35px rgba(239,68,68,0.5)"
  }
};
