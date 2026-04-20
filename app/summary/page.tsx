"use client";
import React, { useState, useEffect } from "react";
import { Users, Utensils, ShoppingCart, TrendingUp, ClipboardList } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

interface Member {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

interface MealRecord {
  _id: string;
  memberId: { _id: string };
  total: number;
}

interface BazarRecord {
  _id: string;
  memberId: string | { _id?: string };
  total?: number;
  quantity?: number;
  price?: number;
}

interface RentBill {
  roomRent?: number;
  wifiBill?: number;
  buaBill?: number;
}

export default function SummaryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [bazars, setBazars] = useState<BazarRecord[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { stats } = useGlobalStats();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/members");
        const data = await res.json();
        const saved = localStorage.getItem("mess_user");
        const currentUser = saved ? JSON.parse(saved) : null;
        let updatedList = Array.isArray(data) ? data : [];

        if (currentUser && currentUser.role === "admin") {
          const isAdminInList = updatedList.some(
            (m: Member) => m.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (!isAdminInList) {
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

    const fetchMeals = async () => {
      try {
        const res = await fetch("/api/meals");
        if (res.ok) {
          const data = await res.json();
          setMeals(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    };

    const fetchBazars = async () => {
      try {
        const res = await fetch("/api/bazar");
        if (res.ok) {
          const data = await res.json();
          setBazars(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching bazars:", err);
      }
    };

    const fetchRentBill = async () => {
      try {
        const monthKey = new Date().toISOString().slice(0, 7);
        const monthRes = await fetch(`/api/rent?month=${monthKey}`);
        if (monthRes.ok) {
          const monthData = (await monthRes.json()) as RentBill | null;
          if (monthData) {
            const rent = Number(monthData.roomRent || 0) + Number(monthData.wifiBill || 0) + Number(monthData.buaBill || 0);
            setTotalRent(rent);
            return;
          }
        }

        const latestRes = await fetch("/api/rent");
        if (latestRes.ok) {
          const latestData = (await latestRes.json()) as RentBill | null;
          const rent = latestData
            ? Number(latestData.roomRent || 0) + Number(latestData.wifiBill || 0) + Number(latestData.buaBill || 0)
            : 0;
          setTotalRent(rent);
        }
      } catch (err) {
        console.error("Error fetching rent bill:", err);
      }
    };

    fetchMembers();
    fetchMeals();
    fetchBazars();
    fetchRentBill();
  }, []);

  const mealsByMember = meals.reduce((acc, meal) => {
    const memberId = meal.memberId?._id;
    if (!memberId) return acc;
    acc[memberId] = (acc[memberId] || 0) + (meal.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const getRecordMemberId = (memberRef: BazarRecord["memberId"]): string => {
    if (typeof memberRef === "string") return memberRef;
    return memberRef?._id || "";
  };

  const getBazarAmount = (bazar: BazarRecord): number => {
    if (typeof bazar.total === "number" && Number.isFinite(bazar.total)) {
      return bazar.total;
    }
    const quantity = Number(bazar.quantity || 0);
    const price = Number(bazar.price || 0);
    return quantity * price;
  };

  const bazarsByMember = bazars.reduce((acc, bazar) => {
    const memberId = getRecordMemberId(bazar.memberId);
    if (!memberId) return acc;
    acc[memberId] = (acc[memberId] || 0) + getBazarAmount(bazar);
    return acc;
  }, {} as Record<string, number>);

  const getGiveTake = (memberId: string): { value: number; label: string } => {
    const mealCost = (mealsByMember[memberId] || 0) * stats.mealRate;
    const totalBazar = bazarsByMember[memberId] || 0;
    
    if (totalBazar > mealCost) {
      return { 
        value: mealCost - totalBazar, 
        label: `${(mealCost - totalBazar).toFixed(2)}` 
      };
    } else {
      return { 
        value: mealCost - totalBazar, 
        label: `+${(mealCost - totalBazar).toFixed(2)}` 
      };
    }
  };

  const getBalanceValue = (memberId: string): number => totalRent + getGiveTake(memberId).value;
  const totalGiveTake = members.reduce((sum, member) => sum + getGiveTake(member._id).value, 0);
  const totalBalance = members.length * totalRent + totalGiveTake;

  return (
    <div style={{ animation: "fadeIn 0.5s", width: "100%", paddingRight: "20px" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#f8fafc" }}>Summary</h1>
        <p style={{ color: "#94a3b8", marginTop: "5px" }}>Comprehensive member meal and cost tracking</p>
      </header>

      {/* STATS SECTION - NOW WITH VIOLET GRADIENT BOXES */}
      <div style={statsGridStyle}>
        <StatCard 
          title="Total Members" 
          value={loading ? "..." : stats.totalMembers.toString()} 
          icon={<Users size={20} color="#ffffff" />} 
        />
        <StatCard 
          title="Total Meals" 
          value={stats.totalMeals.toFixed(1)} 
          icon={<Utensils size={20} color="#ffffff" />} 
        />
        <StatCard 
          title="Total Bazar" 
          value={`৳${stats.totalBazar.toFixed(0)}`} 
          icon={<ShoppingCart size={20} color="#ffffff" />} 
        />
        <StatCard 
          title="Meal Rate" 
          value={`৳${stats.mealRate.toFixed(2)}`} 
          icon={<TrendingUp size={20} color="#ffffff" />} 
        />
      </div>

      {/* MEMBER SUMMARY BOX */}
      <div style={tableContainerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" }}>
          <div style={logoWrapperStyle}><ClipboardList size={22} color="#ffffff" /></div>
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" }}>Member Summary</h3>
        </div>

        <div style={{ overflowX: "auto", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Member</th>
                <th style={thStyle}>Total Meals</th>
                <th style={thStyle}>Meal Cost</th>
                <th style={thStyle}>Total Bazar</th>
                <th style={thStyle}>Give/Take</th>
                <th style={{...thStyle, textAlign: "right"}}>Balance</th>
              </tr>
            </thead>
            <tbody style={{ color: "#cbd5e1" }}>
              {members.length > 0 ? (
                members.map((member) => {
                  const giveTake = getGiveTake(member._id);
                  const balanceValue = getBalanceValue(member._id);

                  return (
                  <tr key={member._id} style={trStyle}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={avatarStyle}>{member.username.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong style={{ color: "#f8fafc", display: "block", fontSize: "14px" }}>{member.username}</strong>
                          <small style={{ color: '#94a3b8' }}>{member.email}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px", color: '#10b981', fontWeight: '700' }}>
                      {(mealsByMember[member._id] || 0).toFixed(1)}
                    </td>
                    <td style={{ padding: "12px", fontWeight: '500' }}>
                      ৳{((mealsByMember[member._id] || 0) * stats.mealRate).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", color: '#f59e0b', fontWeight: '600' }}>
                      ৳{(bazarsByMember[member._id] || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", fontWeight: '600', color: giveTake.value > 0 ? '#10b981' : '#ef4444' }}>
                      ৳{giveTake.label}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <span
                        style={{
                          ...balanceBadgeStyle,
                          color: balanceValue >= 0 ? '#cbd5e1' : '#fda4af',
                          border: balanceValue >= 0 ? '1px solid #334155' : '1px solid #7f1d1d'
                        }}
                      >
                        ৳{balanceValue.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>No members found.</td></tr>
              )}
            </tbody>

            <tfoot>
              <tr style={tfootStyle}>
                <td style={{ padding: "20px 12px", fontWeight: "800", color: "#f8fafc" }}>Total Summary</td>
                <td style={{ padding: "20px 12px", fontWeight: "800", color: "#10b981" }}>{stats.totalMeals.toFixed(1)}</td>
                <td style={{ padding: "20px 12px", fontWeight: "800", color: "#f8fafc" }}>৳{(stats.totalMeals * stats.mealRate).toFixed(2)}</td>
                <td style={{ padding: "20px 12px", fontWeight: "800", color: "#f8fafc" }}>৳{stats.totalBazar.toFixed(2)}</td>
                <td style={{ padding: "20px 12px", fontWeight: "800", color: "#f8fafc" }}>৳{((stats.totalMeals * stats.mealRate) - stats.totalBazar).toFixed(2)}</td>
                <td style={{ padding: "20px 12px", fontWeight: "800", color: "#f8fafc", textAlign: "right" }}>৳{totalBalance.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon }: any) {
  return (
    <div style={statCardStyle}>
      <div style={{ flex: 1 }}>
        <p style={statLabelStyle}>{title}</p>
        <h2 style={statValueStyle}>{value}</h2>
      </div>
      <div style={iconContainerStyle}>{icon}</div>
    </div>
  );
}

// --- STYLES ---

const statsGridStyle: React.CSSProperties = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
  gap: "20px",
  width: "100%",
  marginBottom: "30px"
};

const statCardStyle: React.CSSProperties = { 
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", // Admin Violet Gradient
  padding: "24px", 
  borderRadius: "16px", 
  display: "flex", 
  alignItems: "center",
  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

const iconContainerStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "10px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.2)", // Glass effect icon box
  border: "1px solid rgba(255, 255, 255, 0.3)"
};

const statLabelStyle = { color: "#ffffff", opacity: 0.9, margin: 0, fontSize: "13px", fontWeight: "600" };
const statValueStyle = { margin: "5px 0 0 0", fontSize: "24px", fontWeight: "800", color: "#ffffff" };

const tableContainerStyle: React.CSSProperties = { 
  background: "#0f172a", 
  padding: "30px", 
  borderRadius: "24px", 
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", 
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #1e293b"
};

const logoWrapperStyle: React.CSSProperties = {
  background: "#4f46e5", 
  width: "40px", 
  height: "40px", 
  borderRadius: "10px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center"
};

const thStyle: React.CSSProperties = { 
  padding: "16px 12px", 
  textAlign: "left", 
  color: "#94a3b8", 
  fontSize: "12px", 
  fontWeight: "700",
  textTransform: "uppercase",
  borderBottom: "1px solid #1e293b"
};

const tableHeaderStyle: React.CSSProperties = { background: "#1e293b" };
const trStyle: React.CSSProperties = { borderBottom: "1px solid #1e293b" };

const avatarStyle: React.CSSProperties = {
  width: "36px", 
  height: "36px", 
  background: "#1e293b", 
  borderRadius: "8px", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  fontWeight: "bold", 
  color: "#3b82f6"
};

const balanceBadgeStyle: React.CSSProperties = { 
  background: '#1e293b', 
  color: '#cbd5e1', 
  padding: '6px 12px', 
  borderRadius: '8px', 
  fontSize: '12px', 
  fontWeight: '700' 
};

const tfootStyle: React.CSSProperties = {
  background: "#1e293b",
  borderTop: "2px solid #334155",
};