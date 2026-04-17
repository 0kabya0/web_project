"use client";
import React, { useState } from "react";
import { 
  BarChart3, 
  UtensilsCrossed, 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  ChevronDown,
  Scale,
  Download
} from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Monthly Summary");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Monthly Summary":
        return (
          <div style={innerSummaryCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h4 style={{ margin: 0, fontSize: "16px", color: "#94a3b8", fontWeight: "600" }}>Current Period</h4>
              <div style={statusBadgeStyle}>৳0.00</div>
            </div>
            <div style={innerGridStyle}>
              <SummaryItem label="Total Meals" value="0" icon={<UtensilsCrossed size={16} color="#22c55e" />} bgColor="rgba(34, 197, 94, 0.1)" />
              <SummaryItem label="Total Bazar" value="৳0" icon={<ShoppingCart size={16} color="#eab308" />} bgColor="rgba(234, 179, 8, 0.1)" />
              <SummaryItem label="Total Payments" value="৳0" icon={<Wallet size={16} color="#6366f1" />} bgColor="rgba(99, 102, 241, 0.1)" />
              <SummaryItem label="Meal Rate" value="৳0.00" icon={<TrendingUp size={16} color="#a855f7" />} bgColor="rgba(168, 85, 247, 0.1)" />
            </div>
          </div>
        );

      case "Balance Sheet":
      case "Meals":
      case "Bazar":
        const titles: any = { "Balance Sheet": "Member Balance Sheet", "Meals": "Daily Meal Records", "Bazar": "Bazar Expenditure" };
        const headers: any = {
          "Balance Sheet": ["Member", "Meals", "Meal Cost", "Paid", "Balance"],
          "Meals": ["Member", "Date", "Lunch", "Dinner", "Total"],
          "Bazar": ["Purchased By", "Date", "Description/Items", "Amount"]
        };
        
        return (
          <div style={tableWrapperStyle}>
            <div style={tableHeaderActionStyle}>
              <h3 style={tableTitleStyle}>{titles[activeTab]}</h3>
              <button style={exportButtonStyle}><Download size={14} /> Export</button>
            </div>
            <div style={{ overflowX: "auto", borderRadius: "12px" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableRowHeaderStyle}>
                    {headers[activeTab].map((h: string, i: number) => (
                      <th key={h} style={{ ...thStyle, textAlign: i === headers[activeTab].length - 1 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={5} style={emptyTdStyle}>No records found for this term.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.5s", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
      {/* PAGE HEADER */}
      <header style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#ffffff" }}>Reports & Analytics</h1>
        <p style={{ color: "#94a3b8", marginTop: "5px" }}>Comprehensive mess financial data</p>
      </header>

      {/* FILTER BOX */}
      <div style={selectorContainerStyle}>
        <Calendar size={18} color="#94a3b8" />
        <select style={selectInputStyle}>
          <option>Select Manager Term</option>
        </select>
        <ChevronDown size={18} color="#94a3b8" style={{ marginLeft: "auto" }} />
      </div>

      {/* TOP STATS CARDS - VIOLET GRADIENT ADDED */}
      <div style={statsGridStyle}>
        <StatCard label="Total Meals" value="0" icon={<UtensilsCrossed size={20} color="#ffffff" />} />
        <StatCard label="Total Bazar" value="৳0" icon={<ShoppingCart size={20} color="#ffffff" />} />
        <StatCard label="Total Payments" value="৳0" icon={<Wallet size={20} color="#ffffff" />} />
        <StatCard label="Meal Rate" value="৳0.00" icon={<TrendingUp size={20} color="#ffffff" />} />
      </div>

      {/* NAVIGATION TABS */}
      <div style={tabContainerStyle}>
        <TabButton title="Monthly Summary" icon={<BarChart3 size={16} />} active={activeTab} setter={setActiveTab} />
        <TabButton title="Balance Sheet" icon={<Scale size={16} />} active={activeTab} setter={setActiveTab} />
        <TabButton title="Meals" icon={<UtensilsCrossed size={16} />} active={activeTab} setter={setActiveTab} />
        <TabButton title="Bazar" icon={<ShoppingCart size={16} />} active={activeTab} setter={setActiveTab} />
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div style={mainReportCardStyle}>
        {renderTabContent()}
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={statCardStyle}>
      <div style={{ flex: 1 }}>
        <p style={statLabelStyle}>{label}</p>
        <h3 style={statValueStyle}>{value}</h3>
      </div>
      <div style={iconBoxStyle}>{icon}</div>
    </div>
  );
}

function TabButton({ title, icon, active, setter }: any) {
  const isActive = active === title;
  return (
    <button 
      onClick={() => setter(title)}
      style={{
        ...tabButtonStyle,
        backgroundColor: isActive ? "#1e293b" : "transparent",
        color: isActive ? "#f8fafc" : "#94a3b8",
      }}
    >
      {icon} {title}
    </button>
  );
}

function SummaryItem({ label, value, icon, bgColor }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ ...smallIconStyle, backgroundColor: bgColor }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>{value}</p>
      </div>
    </div>
  );
}

// --- STYLES ---

const selectorContainerStyle: React.CSSProperties = {
  background: "#0f172a", padding: "12px 20px", borderRadius: "12px",
  display: "flex", alignItems: "center", gap: "10px", marginBottom: "25px",
  width: "100%", maxWidth: "400px", border: "1px solid #1e293b"
};

const selectInputStyle: React.CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontSize: "14px", color: "#cbd5e1", width: "100%", cursor: "pointer"
};

const statsGridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px", marginBottom: "30px"
};

// VIOLET GRADIENT APPLIED HERE
const statCardStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", 
  padding: "20px", borderRadius: "16px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

// TRANSPARENT GLASS EFFECT FOR ICON BOX
const iconBoxStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.2)", padding: "10px", borderRadius: "12px",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "1px solid rgba(255, 255, 255, 0.3)"
};

const statLabelStyle = { margin: 0, color: "#ffffff", opacity: 0.9, fontSize: "13px", fontWeight: "600" };
const statValueStyle = { margin: "5px 0 0 0", color: "#ffffff", fontSize: "22px", fontWeight: "800" };

const tabContainerStyle: React.CSSProperties = {
  display: "flex", gap: "5px", marginBottom: "25px", background: "#0f172a",
  padding: "5px", borderRadius: "12px", width: "fit-content", border: "1px solid #1e293b"
};

const tabButtonStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
  borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600",
  cursor: "pointer", transition: "all 0.2s"
};

const mainReportCardStyle: React.CSSProperties = {
  background: "#0f172a", padding: "30px", borderRadius: "24px",
  border: "1px solid #1e293b", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", minHeight: "350px"
};

const innerSummaryCardStyle: React.CSSProperties = {
  border: "1px solid #1e293b", borderRadius: "20px", padding: "25px", maxWidth: "500px"
};

const statusBadgeStyle = {
  background: "#1e293b", color: "#cbd5e1", padding: "4px 12px",
  borderRadius: "999px", fontSize: "13px", fontWeight: "700"
};

const innerGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };

const smallIconStyle: React.CSSProperties = {
  width: "36px", height: "36px", borderRadius: "10px",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const tableWrapperStyle: React.CSSProperties = { width: "100%" };
const tableHeaderActionStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"
};

const tableTitleStyle = { margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" };

const exportButtonStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px",
  background: "#1e293b", border: "1px solid #334155", borderRadius: "8px",
  fontSize: "12px", fontWeight: "600", color: "#cbd5e1", cursor: "pointer"
};

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: "600px" };
const tableRowHeaderStyle = { background: "#1e293b" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "16px 12px", color: "#94a3b8", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const };
const emptyTdStyle: React.CSSProperties = { padding: "80px 0", textAlign: "center", color: "#64748b", fontSize: "14px", borderBottom: "none" };