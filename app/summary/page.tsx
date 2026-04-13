"use client";
import React, { useState, useEffect } from "react";
import { Users, Utensils, ShoppingCart, TrendingUp } from "lucide-react";

interface Member {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

export default function SummaryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // 1. Fetch existing members from your MongoDB API
        const res = await fetch("/api/members");
        const data = await res.json();
        
        // 2. Get the currently logged-in user from localStorage
        const saved = localStorage.getItem("mess_user");
        const currentUser = saved ? JSON.parse(saved) : null;

        let updatedList = Array.isArray(data) ? data : [];

        // 3. Logic: If logged in as Admin, ensure Admin is visible in the member list
        if (currentUser && currentUser.role === "admin") {
          const isAdminInList = updatedList.some(
            (m: Member) => m.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          
          if (!isAdminInList) {
            // Add admin to the top of the list manually for the UI
            updatedList = [
              { 
                _id: "admin-temp-id", 
                username: currentUser.username, 
                email: currentUser.email || "admin@system.com", 
                role: "admin" 
              }, 
              ...updatedList
            ];
          }
        }
        
        setMembers(updatedList);
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div style={{ animation: "fadeIn 0.5s" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#f8fafc" }}>Summary</h1>
        <p style={{ color: "#94a3b8", marginTop: "5px" }}>Comprehensive member meal and cost tracking</p>
      </header>

      {/* STATS SECTION */}
      <div style={statsGridStyle}>
        <StatCard 
          title="Total Members" 
          value={loading ? "..." : members.length.toString()} 
          icon={<Users color="#3b82f6" />} 
        />
        <StatCard title="Total Meals" value="0" icon={<Utensils color="#10b981" />} />
        <StatCard title="Total Bazar" value="৳0" icon={<ShoppingCart color="#f59e0b" />} />
        <StatCard title="Meal Rate" value="৳0.00" icon={<TrendingUp color="#8b5cf6" />} />
      </div>

      {/* MEMBER LIST TABLE CONTAINER */}
      <div style={tableContainerStyle}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>Member Summary</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Member</th>
                <th style={thStyle}>Total Meals</th>
                <th style={thStyle}>Meal Cost</th>
                <th style={thStyle}>Total Payment</th>
                <th style={thStyle}>Due</th>
                <th style={thStyle}>Balance</th>
              </tr>
            </thead>
            <tbody style={{ color: "#334155" }}>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member._id} style={trStyle}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={avatarStyle}>{member.username.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong style={{ color: "#0f172a", display: "block" }}>
                            {member.username}
                            {member.role === "admin" && <span style={adminBadgeStyle}>Admin</span>}
                          </strong>
                          <small style={{ color: '#64748b' }}>{member.email}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px", color: '#10b981', fontWeight: 'bold' }}>0</td>
                    <td style={{ padding: "12px" }}>৳0.00</td>
                    <td style={{ padding: "12px", color: '#6366f1' }}>৳0.00</td>
                    <td style={{ padding: "12px", color: '#ef4444' }}>৳0.00</td>
                    <td style={{ padding: "12px" }}>
                      <span style={balanceBadgeStyle}>৳0.00</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    No members found.
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

// --- STYLES ---

const thStyle: React.CSSProperties = { 
  padding: "15px 12px", 
  textAlign: "left", 
  borderBottom: "2px solid #cbd5e1", // Thicker line for visibility
  color: "#475569", 
  fontSize: "14px",
  fontWeight: "600"
};

const tableHeaderStyle: React.CSSProperties = { background: "#f8fafc" };

const trStyle: React.CSSProperties = { borderBottom: "1px solid #e2e8f0" };

const avatarStyle: React.CSSProperties = {
  width: "36px", height: "36px", background: "#f1f5f9", border: "1px solid #e2e8f0",
  borderRadius: "50%", display: "flex", justifyContent: "center", 
  alignItems: "center", fontWeight: "bold", fontSize: "14px", color: "#3b82f6"
};

const adminBadgeStyle: React.CSSProperties = {
  marginLeft: "8px", background: "#dcfce7", color: "#166534",
  fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold",
  verticalAlign: "middle"
};

const balanceBadgeStyle: React.CSSProperties = { 
  background: '#f1f5f9', color: '#64748b', padding: '4px 10px', 
  borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' 
};

const tableContainerStyle: React.CSSProperties = { 
  background: "#ffffff", padding: "30px", borderRadius: "24px", 
  marginTop: "30px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  width: "100%"
};

const statsGridStyle: React.CSSProperties = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
  gap: "20px" 
};

const cardStyle: React.CSSProperties = { 
  background: "rgba(255,255,255,0.03)", padding: "20px", 
  borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", 
  display: "flex", justifyContent: "space-between", alignItems: "center" 
};

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div style={cardStyle} className="move-card">
      <div>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>{title}</p>
        <h2 style={{ margin: "5px 0 0 0", fontSize: "24px", fontWeight: "bold", color: "#f8fafc" }}>{value}</h2>
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" }}>{icon}</div>
    </div>
  );
}