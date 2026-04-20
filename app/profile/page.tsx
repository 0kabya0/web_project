"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Mail, Calendar, TrendingUp } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

interface Member {
  _id: string;
  username: string;
}

interface MealRecord {
  _id: string;
  memberId: { _id?: string } | string | null;
  date: string;
  total: number;
}

interface BazarRecord {
  _id: string;
  memberId: { _id?: string } | string | null;
  date: string;
  total?: number;
  quantity?: number;
  price?: number;
}

interface PaymentRecord {
  _id: string;
  memberId: { _id?: string } | string | null;
  amount: number;
  paidDate: string;
  monthKey?: string;
  status?: string;
}

interface RentBill {
  roomRent?: number;
  wifiBill?: number;
  buaBill?: number;
}

export default function ProfilePage() {
  const { stats } = useGlobalStats();
  const [userData, setUserData] = useState({ username: "Guest", email: "user@example.com", role: "Member", status: "Active" });
  const [memberId, setMemberId] = useState("");
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [bazars, setBazars] = useState<BazarRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [rentBill, setRentBill] = useState<RentBill>({ roomRent: 0, wifiBill: 0, buaBill: 0 });

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserData({
        username: parsed.role === "admin" ? `${parsed.username} - Manager` : (parsed.username || "User"),
        email: parsed.email || `${parsed.username?.toLowerCase().replace(/\s/g, "")}@gmail.com`,
        role: parsed.role === "admin" ? "Admin - Manager" : "Member",
        status: parsed.status || (parsed.role === "admin" ? "Approved" : "Active")
      });

      const fetchProfileData = async () => {
        try {
          const monthKey = new Date().toISOString().slice(0, 7);
          const [membersRes, mealsRes, bazarsRes, paymentsRes, rentRes] = await Promise.all([
            fetch("/api/members"),
            fetch("/api/meals"),
            fetch("/api/bazar"),
            fetch("/api/payments"),
            fetch(`/api/rent?month=${monthKey}`),
          ]);

          if (membersRes.ok) {
            const membersData = (await membersRes.json()) as Member[];
            const currentMember = membersData.find((m) => (m.username || "").toLowerCase() === (parsed.username || "").toLowerCase());
            setMemberId(currentMember?._id || "");
          }
          if (mealsRes.ok) {
            const data = await mealsRes.json();
            setMeals(Array.isArray(data) ? data : []);
          }
          if (bazarsRes.ok) {
            const data = await bazarsRes.json();
            setBazars(Array.isArray(data) ? data : []);
          }
          if (paymentsRes.ok) {
            const data = await paymentsRes.json();
            setPayments(Array.isArray(data) ? data : []);
          }
          if (rentRes.ok) {
            const data = (await rentRes.json()) as RentBill | null;
            if (data) setRentBill({
              roomRent: Number(data.roomRent || 0),
              wifiBill: Number(data.wifiBill || 0),
              buaBill: Number(data.buaBill || 0),
            });
          }
        } catch (error) {
          console.error("Error fetching profile financial data:", error);
        }
      };

      fetchProfileData();
    }
  }, []);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const getIdFromRef = (ref: { _id?: string } | string | null | undefined): string => {
    if (!ref) return "";
    if (typeof ref === "string") return ref;
    return ref._id || "";
  };

  const getBazarAmount = (entry: BazarRecord): number => {
    if (typeof entry.total === "number" && Number.isFinite(entry.total)) return entry.total;
    return Number(entry.quantity || 0) * Number(entry.price || 0);
  };

  const monthMeals = useMemo(
    () => meals.filter((m) => (m.date || "").slice(0, 7) === currentMonthKey),
    [meals, currentMonthKey]
  );

  const monthBazars = useMemo(
    () => bazars.filter((b) => (b.date || "").slice(0, 7) === currentMonthKey),
    [bazars, currentMonthKey]
  );

  const memberMeals = useMemo(() => {
    if (!memberId) return 0;
    return monthMeals
      .filter((meal) => getIdFromRef(meal.memberId) === memberId)
      .reduce((sum, meal) => sum + Number(meal.total || 0), 0);
  }, [monthMeals, memberId]);

  const monthMealTotal = useMemo(() => monthMeals.reduce((sum, meal) => sum + Number(meal.total || 0), 0), [monthMeals]);
  const monthBazarTotal = useMemo(() => monthBazars.reduce((sum, entry) => sum + getBazarAmount(entry), 0), [monthBazars]);
  const monthMealRate = monthMealTotal > 0 ? monthBazarTotal / monthMealTotal : 0;
  const memberMealCost = memberMeals * monthMealRate;

  const memberBazar = useMemo(() => {
    if (!memberId) return 0;
    return monthBazars
      .filter((entry) => getIdFromRef(entry.memberId) === memberId)
      .reduce((sum, entry) => sum + getBazarAmount(entry), 0);
  }, [monthBazars, memberId]);

  const totalRent = Number(rentBill.roomRent || 0) + Number(rentBill.wifiBill || 0) + Number(rentBill.buaBill || 0);
  const memberBalance = totalRent + (memberMealCost - memberBazar);
  const khalaBill = Number(rentBill.buaBill || 0);

  const memberPaid = useMemo(() => {
    if (!memberId) return 0;
    return payments
      .filter((payment) => {
        const paymentMemberId = getIdFromRef(payment.memberId);
        const paymentMonth = payment.monthKey || (payment.paidDate || "").slice(0, 7);
        return paymentMemberId === memberId && paymentMonth === currentMonthKey && payment.status === "completed";
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments, memberId, currentMonthKey]);

  const isPaid = memberBalance <= 0 || memberPaid >= memberBalance;
  const monthLabel = new Date(`${currentMonthKey}-01`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#ffffff" }}>{memberBalance >= 0 ? "" : "-"}৳{Math.abs(memberBalance).toFixed(2)}</h2>
        </div>
      </div>

      <div style={memberInfoCardStyle}>
        <div style={{ marginBottom: "18px" }}>
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" }}>Sign In / Sign Up Information</h3>
          <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Your member account details from the current session</p>
        </div>
        <div style={memberInfoGridStyle}>
          <InfoRow label="Member Name" value={userData.username} />
          <InfoRow label="Email" value={userData.email} />
          <InfoRow label="Role" value={userData.role} />
          <InfoRow label="Status" value={userData.status} />
          <InfoRow label="Current Manager" value="Admin" />
          <InfoRow label="Access Type" value="Member Only" />
        </div>
      </div>

      {/* TAB SECTION */}
      <div style={{ marginBottom: "20px" }}>
        <button style={activeTabStyle}>Term-wise History</button>
      </div>

      {/* FINANCIAL HISTORY TABLE */}
      <div style={tableContainerStyle}>
        <div style={{ marginBottom: "20px", color: "#94a3b8", fontSize: "14px" }}>
          Total Members: {stats.totalMembers} | Total Meals: {stats.totalMeals.toFixed(1)}
        </div>
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
                <th style={thStyle}>Khala Bill</th>
                <th style={thStyle}>Paid</th>
                <th style={{ ...thStyle, textAlign: "right", paddingRight: "10px" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr style={trStyle}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: "700", color: "#f8fafc" }}>{userData.username}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{monthLabel}</div>
                </td>
                <td style={tdStyle}>{memberMeals.toFixed(1)}</td>
                <td style={tdStyle}>৳{monthMealRate.toFixed(2)}</td>
                <td style={tdStyle}>৳{memberMealCost.toFixed(2)}</td>
                <td style={tdStyle}>৳{khalaBill.toFixed(2)}</td>
                <td style={tdStyle}>
                  <span style={isPaid ? paidBadgeStyle : notPaidBadgeStyle}>{isPaid ? "Paid" : "Not Paid"}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "right", color: memberBalance >= 0 ? "#10b981" : "#ef4444", fontWeight: "700", paddingRight: "10px" }}>
                  <TrendingUp size={14} style={{ marginRight: "4px", display: "inline" }} />
                  {memberBalance >= 0 ? "" : "-"}৳{Math.abs(memberBalance).toFixed(2)}
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
  background: "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 28%, rgba(0,0,0,0) 55%), linear-gradient(120deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)",
  padding: "32px",
  borderRadius: "26px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "26px",
  flexWrap: "wrap",
  gap: "22px",
  boxShadow: "0 20px 40px -15px rgba(79, 70, 229, 0.65)",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const balanceContainerStyle: React.CSSProperties = {
  textAlign: "right",
  minWidth: "170px",
  background: "rgba(0, 0, 0, 0.18)",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.2)",
  backdropFilter: "blur(4px)"
};

const avatarStyle: React.CSSProperties = {
  width: "70px",
  height: "70px",
  borderRadius: "18px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  fontWeight: "bold",
  flexShrink: 0,
  border: "1px solid rgba(255, 255, 255, 0.45)",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.35)"
};

const infoItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  opacity: 0.95,
  background: "rgba(0,0,0,0.16)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "999px",
  padding: "6px 10px"
};

const activeTabStyle = {
  padding: "10px 18px",
  borderRadius: "12px",
  border: "1px solid #334155",
  backgroundColor: "#111827",
  color: "#f8fafc",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "default",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
};

const tableContainerStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #0f172a 0%, #0b1220 100%)",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 24px 34px -12px rgba(2, 6, 23, 0.65)",
  border: "1px solid #1f2937",
  overflow: "hidden"
};

const tableHeaderRowStyle = {
  background: "linear-gradient(90deg, #1e293b 0%, #1f2a44 100%)"
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  borderBottom: "1px solid #273449"
};

const trStyle = {
  borderBottom: "1px solid #1f2a3d"
};

const tdStyle: React.CSSProperties = {
  padding: "18px 12px",
  color: "#cbd5e1",
  fontSize: "14px",
  verticalAlign: "middle"
};

const paidBadgeStyle = {
  background: "rgba(16, 185, 129, 0.18)",
  color: "#34d399",
  padding: "5px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(52, 211, 153, 0.35)",
  fontSize: "12px",
  fontWeight: "700"
};

const notPaidBadgeStyle = {
  background: "rgba(239, 68, 68, 0.14)",
  color: "#fca5a5",
  padding: "5px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(252, 165, 165, 0.3)",
  fontSize: "12px",
  fontWeight: "700"
};

const memberInfoCardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #0f172a 0%, #0b1220 100%)",
  padding: "24px",
  borderRadius: "24px",
  border: "1px solid #1f2937",
  boxShadow: "0 24px 34px -12px rgba(2, 6, 23, 0.65)",
  marginBottom: "25px"
};

const memberInfoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "12px"
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)", border: "1px solid #23314a", borderRadius: "16px", padding: "14px 16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
      <div style={{ color: "#93a4bf", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>{label}</div>
      <div style={{ color: "#f8fafc", fontSize: "15px", fontWeight: "700", lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}