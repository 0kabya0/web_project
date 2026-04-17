"use client";
import React, { useState, useEffect } from "react";
import { Mail, Calendar, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const [userData, setUserData] = useState({ username: "Guest", email: "user@example.com", role: "Member" });

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserData({
        username: parsed.username || "User",
        email: parsed.email || `${parsed.username?.toLowerCase().replace(/\s/g, "")}@gmail.com`,
        role: parsed.role === "admin" ? "Admin" : "Member"
      });
    }
  }, []);

  return (
    <div style={{ animation: "fadeIn 0.5s", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
      {/* HEADER SECTION */}
      <header style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#ffffff" }}>
          Member Profile
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "5px" }}>
          View comprehensive financial history
        </p>
      </header>

      {/* PROFILE INFO CARD - Violet Admin Gradient Style */}
      <div style={profileCardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={avatarStyle}>
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#ffffff" }}>
              {userData.username}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "8px" }}>
              <span style={infoItemStyle}>
                <Mail size={14} color="#ffffff" style={{ opacity: 0.8 }} /> {userData.email}
              </span>
              <span style={infoItemStyle}>
                <Calendar size={14} color="#ffffff" style={{ opacity: 0.8 }} /> Joined Apr 1, 2026
              </span>
            </div>
          </div>
        </div>
        <div style={balanceContainerStyle}>
          <p style={{ margin: 0, color: "#ffffff", opacity: 0.8, fontSize: "13px", fontWeight: "600" }}>Total Balance</p>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#ffffff" }}>+৳0.00</h2>
        </div>
      </div>

      {/* TAB SECTION */}
      <div style={{ marginBottom: "20px" }}>
        <button style={activeTabStyle}>Term-wise History</button>
      </div>

      {/* FINANCIAL HISTORY TABLE */}
      <div style={tableContainerStyle}>
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" }}>
            Financial History by Manager Term
          </h3>
          <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
            Detailed breakdown for each manager's period
          </p>
        </div>

        <div style={{ overflowX: "auto", width: "100%", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Manager Term</th>
                <th style={thStyle}>Meals</th>
                <th style={thStyle}>Meal Rate</th>
                <th style={thStyle}>Meal Cost</th>
                <th style={thStyle}>Khala Share</th>
                <th style={thStyle}>Paid</th>
                <th style={{ ...thStyle, textAlign: "right", paddingRight: "10px" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr style={trStyle}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: "700", color: "#f8fafc" }}>{userData.username}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Apr 1 - Apr 14, 2026</div>
                </td>
                <td style={tdStyle}>0</td>
                <td style={tdStyle}>৳0.00</td>
                <td style={tdStyle}>৳0.00</td>
                <td style={tdStyle}>৳0.00</td>
                <td style={tdStyle}>
                  <span style={paidBadgeStyle}>৳0</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "right", color: "#10b981", fontWeight: "700", paddingRight: "10px" }}>
                  <TrendingUp size={14} style={{ marginRight: "4px", display: "inline" }} />
                  ৳0.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---

const profileCardStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", 
  padding: "30px",
  borderRadius: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
  flexWrap: "wrap",
  gap: "20px",
  boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

const balanceContainerStyle: React.CSSProperties = {
  textAlign: "right",
  minWidth: "120px"
};

const avatarStyle: React.CSSProperties = {
  width: "65px",
  height: "65px",
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.2)", 
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  fontWeight: "bold",
  flexShrink: 0,
  border: "1px solid rgba(255, 255, 255, 0.3)"
};

const infoItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color: "#ffffff",
  fontSize: "14px",
  opacity: 0.9
};

const activeTabStyle = {
  padding: "10px 20px",
  borderRadius: "12px",
  border: "1px solid #1e293b",
  backgroundColor: "#1e293b",
  color: "#f8fafc",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "default"
};

const tableContainerStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
  border: "1px solid #1e293b",
  overflow: "hidden"
};

const tableHeaderRowStyle = {
  background: "#1e293b"
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "15px 12px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const
};

const trStyle = {
  borderBottom: "1px solid #1e293b"
};

const tdStyle: React.CSSProperties = {
  padding: "20px 12px",
  color: "#cbd5e1",
  fontSize: "14px"
};

const paidBadgeStyle = {
  background: "rgba(59, 130, 246, 0.1)",
  color: "#3b82f6",
  padding: "4px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "700"
};