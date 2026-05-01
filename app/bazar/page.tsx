"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Filter, Package, Calendar } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

interface BazarRecord {
  _id: string;
  memberId: { _id: string; username: string } | string | null;
  item: string;
  quantity: number;
  unit: string;
  price: number;
  date: string;
}

interface Member {
  _id: string;
  username: string;
}

export default function BazarPage() {
  const { stats } = useGlobalStats();
  const [selectedMember, setSelectedMember] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [bazarHistory, setBazarHistory] = useState<BazarRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bazar records and members
  useEffect(() => {
    fetchBazarHistory();
    fetchMembers();
  }, []);

  const fetchBazarHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bazar");
      if (response.ok) {
        const data = await response.json();
        setBazarHistory(data);
      }
    } catch (error) {
      console.error("Error fetching bazar history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const getMemberName = (member: BazarRecord['memberId']) => {
    if (!member || typeof member === 'string') return 'Unknown Member';
    return member.username || 'Unknown Member';
  };

  const getMemberInitial = (member: BazarRecord['memberId']) => {
    return getMemberName(member).charAt(0).toUpperCase();
  };

  // Filter bazar records
  let filteredBazar = bazarHistory;
  if (selectedMember !== "All") {
    filteredBazar = filteredBazar.filter(
      (b) => getMemberName(b.memberId) === selectedMember
    );
  }
  if (selectedDate) {
    filteredBazar = filteredBazar.filter((b) => b.date.startsWith(selectedDate));
  }

  // Calculate total amount for filtered records
  const totalAmount = filteredBazar.reduce((sum, b) => sum + (b.price * b.quantity), 0);

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
              ৳{stats.totalBazar.toFixed(0)}
          </h2>
          <p style={{ margin: "8px 0 0 0", opacity: 0.85, fontSize: "13px" }}>
            Total Members: {stats.totalMembers} | Total Meals: {stats.totalMeals.toFixed(1)}
          </p>
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
            {members.map((m) => (
              <option key={m._id} value={m.username}>
                {m.username}
              </option>
            ))}
          </select>
        </div>

          <div style={dateWrapperStyle}>
            <Calendar size={18} color="#94a3b8" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={dateStyle}
            />
          </div>

          {(selectedMember !== "All" || selectedDate) && (
            <button
              onClick={() => {
                setSelectedMember("All");
                setSelectedDate("");
              }}
              style={clearButtonStyle}
            >
              Clear Filters
            </button>
          )}
      </div>

      {/* BAZAR HISTORY TABLE CONTAINER - Color Updated to Dark UI */}
      <div style={tableContainerStyle}>
        <h3 style={tableHeaderTitleStyle}>Bazar History</h3>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading...</div>
        ) : (
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
                {filteredBazar.length > 0 ? (
                  filteredBazar.map((record) => (
                    <tr key={record._id} style={trStyle}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={avatarStyle}>{getMemberInitial(record.memberId)}</div>
                          <span style={{ fontWeight: "600", color: "#f8fafc" }}>
                            {getMemberName(record.memberId)}
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        {record.quantity} {record.unit} - {record.item}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold", color: "#f8fafc" }}>
                        ৳{(record.price * record.quantity).toFixed(0)}
                      </td>
                    </tr>
                  ))
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
        )}
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
  gap: "15px",
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

const dateWrapperStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "12px 18px",
  borderRadius: "14px",
  width: "220px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  border: "1px solid #1e293b"
};

const dateStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  color: "#cbd5e1",
  background: "transparent",
  cursor: "pointer"
};

const clearButtonStyle: React.CSSProperties = {
  background: "#1e293b",
  color: "#94a3b8",
  border: "1px solid #334155",
  padding: "12px 15px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "14px",
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

const avatarStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  flexShrink: 0
};