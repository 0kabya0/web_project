"use client";
import React, { useState } from "react";
import { ShoppingCart, Filter, Package } from "lucide-react";

export default function BazarPage() {
  const [selectedMember, setSelectedMember] = useState("All");

  // This will be populated once you connect your MongoDB
  const bazarHistory = [];

  return (
    <div style={{ animation: "fadeIn 0.5s", color: "#f8fafc", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
      {/* HEADER SECTION */}
      <header style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>Bazar</h1>
        <p style={{ color: "#94a3b8", marginTop: "5px" }}>
          View all grocery purchases (used for meal rate calculation)
        </p>
      </header>

      {/* UPDATED BAZAR CARD - Matches Dashboard Manager Box */}
      <div style={totalBazarCardStyle}>
        <div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>Total Bazar</p>
          <h2 style={{ margin: "5px 0 0 0", fontSize: "42px", fontWeight: "800" }}>
            ৳0
          </h2>
        </div>
        <div style={iconWrapperStyle}>
          <ShoppingCart size={40} color="#fff" />
        </div>
      </div>

      {/* FILTER BAR - Color Updated */}
      <div style={filterBarStyle}>
        <div style={selectWrapperStyle}>
          <Filter size={18} color="#94a3b8" />
          <select 
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={selectStyle}
          >
            <option>All</option>
          </select>
        </div>
      </div>

      {/* BAZAR HISTORY TABLE CONTAINER - Color Updated to Dark UI */}
      <div style={tableContainerStyle}>
        <h3 style={tableHeaderTitleStyle}>Bazar History</h3>
        
        <div style={{ overflowX: "auto", width: "100%", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Purchased By</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Items</th>
                <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bazarHistory.length > 0 ? (
                null
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Package size={40} color="#1e293b" />
                      <span style={{ fontSize: "15px" }}>No bazar records found yet.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- UPDATED STYLES ---

const totalBazarCardStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
  padding: "40px",
  borderRadius: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.3)",
  color: "#ffffff"
};

const iconWrapperStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.2)",
  padding: "15px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const filterBarStyle: React.CSSProperties = {
  display: "flex",
  marginBottom: "25px"
};

const selectWrapperStyle: React.CSSProperties = {
  background: "#0f172a", // Dark background
  padding: "12px 18px",
  borderRadius: "14px",
  width: "280px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  border: "1px solid #1e293b" // Darker border
};

const selectStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  color: "#cbd5e1", // Light text
  background: "transparent",
  fontSize: "14px",
  cursor: "pointer"
};

const tableContainerStyle: React.CSSProperties = {
  background: "#0f172a", // Match Admin Box color
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #1e293b",
  overflow: "hidden"
};

const tableHeaderTitleStyle = { 
  color: "#f8fafc", // White text
  marginBottom: "25px", 
  fontSize: "18px", 
  fontWeight: "800" 
};

const tableHeaderRowStyle = { 
  background: "#1e293b" // Dark header row
};

const thStyle: React.CSSProperties = { 
  textAlign: "left", 
  padding: "15px 12px", 
  color: "#94a3b8", // Slate text
  fontSize: "12px", 
  fontWeight: "700",
  textTransform: "uppercase"
};

const trStyle = { 
  borderBottom: "1px solid #1e293b" 
};

const tdStyle: React.CSSProperties = { 
  padding: "20px 12px", 
  color: "#cbd5e1", // Muted white
  fontSize: "14px",
  borderBottom: "1px solid #1e293b" 
};