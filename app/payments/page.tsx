"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Wallet, Filter, History } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

interface PaymentRecord {
  _id: string;
  memberId: { _id: string; username: string };
  paidDate: string;
  description: string;
  amount: number;
  status?: string;
}

interface Member {
  _id: string;
  username: string;
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

export default function PaymentsPage() {
  const { stats } = useGlobalStats();
  const [userRole, setUserRole] = useState("user");
  const [selectedMember, setSelectedMember] = useState("All");
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [bazars, setBazars] = useState<BazarRecord[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocalMonthKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const currentMonthKey = getLocalMonthKey();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const monthKey = getLocalMonthKey();
        const [paymentsRes, membersRes, mealsRes, bazarsRes, rentMonthRes, rentLatestRes] = await Promise.all([
          fetch("/api/payments"),
          fetch("/api/members"),
          fetch("/api/meals"),
          fetch("/api/bazar"),
          fetch(`/api/rent?month=${monthKey}`),
          fetch("/api/rent"),
        ]);

        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPaymentHistory(Array.isArray(data) ? data : []);
        }
        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(Array.isArray(data) ? data : []);
        }
        if (mealsRes.ok) {
          const data = await mealsRes.json();
          setMeals(Array.isArray(data) ? data : []);
        }
        if (bazarsRes.ok) {
          const data = await bazarsRes.json();
          setBazars(Array.isArray(data) ? data : []);
        }

        let rentData: RentBill | null = null;
        if (rentMonthRes.ok) {
          rentData = await rentMonthRes.json();
        }
        if (!rentData && rentLatestRes.ok) {
          rentData = await rentLatestRes.json();
        }
        if (rentData) {
          setTotalRent(Number(rentData.roomRent || 0) + Number(rentData.wifiBill || 0) + Number(rentData.buaBill || 0));
        } else {
          setTotalRent(0);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    const saved = localStorage.getItem("mess_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserRole(parsed?.role || "user");
      } catch {
        setUserRole("user");
      }
    }

    fetchPayments();
  }, []);

  const membersForFilter = useMemo(() => {
    const map = new Map<string, string>();
    const source = members.length > 0 ? members : paymentHistory.map((p) => ({ _id: p.memberId?._id, username: p.memberId?.username } as Member));
    source.forEach((m) => {
      if (m?._id && m?.username) {
        map.set(m._id, m.username);
      }
    });
    return Array.from(map.entries()).map(([id, username]) => ({ id, username }));
  }, [members, paymentHistory]);

  const getRecordMemberId = (memberRef: BazarRecord["memberId"]): string => {
    if (typeof memberRef === "string") return memberRef;
    return memberRef?._id || "";
  };

  const getBazarAmount = (bazar: BazarRecord): number => {
    if (typeof bazar.total === "number" && Number.isFinite(bazar.total)) {
      return bazar.total;
    }
    return Number(bazar.quantity || 0) * Number(bazar.price || 0);
  };

  const mealsByMember = useMemo(() => {
    return meals.reduce((acc, meal) => {
      if (String((meal as any).date || "").slice(0, 7) !== currentMonthKey) return acc;
      const memberId = meal.memberId?._id;
      if (!memberId) return acc;
      acc[memberId] = (acc[memberId] || 0) + (meal.total || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [meals, currentMonthKey]);

  const bazarsByMember = useMemo(() => {
    return bazars.reduce((acc, bazar) => {
      if (String((bazar as any).date || "").slice(0, 7) !== currentMonthKey) return acc;
      const memberId = getRecordMemberId(bazar.memberId);
      if (!memberId) return acc;
      acc[memberId] = (acc[memberId] || 0) + getBazarAmount(bazar);
      return acc;
    }, {} as Record<string, number>);
  }, [bazars, currentMonthKey]);

  const monthPayments = useMemo(() => {
    return paymentHistory.filter((payment) => {
      const monthFromPaidDate = payment.paidDate ? String(payment.paidDate).slice(0, 7) : "";
      const monthKey = (payment as any).monthKey || monthFromPaidDate;
      return monthKey === currentMonthKey;
    });
  }, [paymentHistory, currentMonthKey]);

  const getGiveTakeValue = (memberId: string): number => {
    const mealCost = (mealsByMember[memberId] || 0) * stats.mealRate;
    const totalBazar = bazarsByMember[memberId] || 0;
    return mealCost - totalBazar;
  };

  const getMemberBalance = (memberId: string): number => totalRent + getGiveTakeValue(memberId);

  const paidMemberIds = useMemo(() => {
    const ids = new Set<string>();
    monthPayments.forEach((payment) => {
      if (payment.status !== "completed") return;
      const memberId = payment.memberId?._id;
      if (memberId) ids.add(memberId);
    });
    return ids;
  }, [monthPayments]);

  const totalPaidBalance = useMemo(() => {
    return members
      .filter((member) => paidMemberIds.has(member._id))
      .reduce((sum, member) => sum + getMemberBalance(member._id), 0);
  }, [members, paidMemberIds, totalRent, mealsByMember, bazarsByMember, stats.mealRate]);

  const filteredPayments = useMemo(() => {
    if (selectedMember === "All") return monthPayments;
    return monthPayments.filter((item) => item.memberId?.username === selectedMember);
  }, [monthPayments, selectedMember]);

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
            <p style={{ margin: 0, opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>Total Payment</p>
          <h2 style={{ margin: "5px 0 0 0", fontSize: "42px", fontWeight: "800" }}>
              ৳{totalPaidBalance.toFixed(0)}
          </h2>
          <p style={{ margin: "8px 0 0 0", opacity: 0.85, fontSize: "13px" }}>
            Total Members: {stats.totalMembers} | Total Meals: {stats.totalMeals.toFixed(1)}
          </p>
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
            {membersForFilter.map((member) => (
              <option key={member.id} value={member.username}>
                {member.username}
              </option>
            ))}
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
                <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Balance</th>
                <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                  <tr key={item._id} style={trStyle}>
                    <td style={tdStyle}>{item.memberId?.username || "Unknown"}</td>
                    <td style={tdStyle}>{new Date(item.paidDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      {item.description || "Monthly expense payment"}
                      {item.status && item.status !== "completed" ? (
                        <span style={{ color: "#f59e0b" }}> ({item.status})</span>
                      ) : null}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px", fontWeight: "bold", color: getMemberBalance(item.memberId?._id || "") >= 0 ? "#22c55e" : "#f87171" }}>
                      ৳{getMemberBalance(item.memberId?._id || "").toFixed(2)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px", fontWeight: "bold", color: "#f8fafc" }}>৳{item.amount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
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