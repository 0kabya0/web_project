"use client";
import React, { useState } from "react";
import { Wallet, Filter, History } from "lucide-react";

export default function PaymentsPage() {
  const [selectedMember, setSelectedMember] = useState("All");

  // This will be populated from MongoDB later
  const paymentHistory = [];

  return (
    <div style={{ animation: "fadeIn 0.5s", color: "#f8fafc", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
      {/* HEADER SECTION */}
      <header style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>Payments</h1>
        <p style={subTextStyle}>
          View all member payments (টাকা জমা)
        </p>
      </header>

      {/* TOTAL PAYMENTS CARD */}
      <div style={totalPaymentsCardStyle}>
        <div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>Total Payments</p>
          <h2 style={{ margin: "5px 0 0 0", fontSize: "42px", fontWeight: "800" }}>
            ৳0
          </h2>
        </div>
        <div style={iconWrapperStyle}>
          <Wallet size={40} color="#fff" />
        </div>
      </div>

      {/* FILTER BAR - Dark Theme Updated */}
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

      {/* PAYMENT HISTORY TABLE CONTAINER - Dark Theme Updated */}
      <div style={tableContainerStyle}>
        <h3 style={tableHeaderTitleStyle}>Payment History</h3>
        
        <div style={{ overflowX: "auto", width: "100%", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Member</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Note</th>
                <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length > 0 ? (
                paymentHistory.map((item: any) => (
                  <tr key={item.id} style={trStyle}>
                    <td style={tdStyle}>{item.member}</td>
                    <td style={tdStyle}>{item.date}</td>
                    <td style={tdStyle}>{item.note}</td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px", fontWeight: "bold", color: "#f8fafc" }}>৳{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <History size={40} color="#1e293b" />
                      <span style={{ fontSize: "15px" }}>No payment records found yet.</span>
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

// --- CSS-IN-JS STYLES ---

const subTextStyle = { color: "#94a3b8", marginTop: "5px" };

const totalPaymentsCardStyle: React.CSSProperties = {
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
  background: "#0f172a",
  padding: "12px 18px",
  borderRadius: "14px",
  width: "280px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  border: "1px solid #1e293b"
};

const selectStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  color: "#cbd5e1",
  background: "transparent",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer"
};

const tableContainerStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #1e293b",
  overflow: "hidden"
};

const tableHeaderTitleStyle = { 
  color: "#f8fafc", 
  marginBottom: "25px", 
  fontSize: "18px", 
  fontWeight: "800" 
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
  textTransform: "uppercase"
};

const tdStyle: React.CSSProperties = { 
  padding: "20px 12px", 
  color: "#cbd5e1", 
  fontSize: "14px",
  borderBottom: "1px solid #1e293b" 
};

const trStyle = { 
  borderBottom: "1px solid #1e293b" 
};