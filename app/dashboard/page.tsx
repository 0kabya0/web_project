"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, Utensils, ShoppingCart, TrendingUp, ArrowUpRight, User 
} from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

export default function Dashboard() {
  const [userData, setUserData] = useState({ username: "Guest", role: "other", isNew: false });
  const [rentBill, setRentBill] = useState({ roomRent: 0, wifiBill: 0, buaBill: 0 });
  const [members, setMembers] = useState<Array<{ _id: string; role?: string }>>([]);
  const [meals, setMeals] = useState<Array<{ memberId: { _id: string } | string | null; total: number }>>([]);
  const [bazars, setBazars] = useState<Array<{ memberId: { _id?: string } | string | null; total?: number; quantity?: number; price?: number }>>([]);
  const [payments, setPayments] = useState<Array<{ memberId: { _id?: string } | string | null; amount?: number }>>([]);
  const { stats } = useGlobalStats();

  const getLocalMonthKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      setUserData(JSON.parse(saved));
    }

    const fetchDashboardData = async () => {
      try {
        const monthKey = getLocalMonthKey();
        const [rentRes, membersRes, mealsRes, bazarsRes, paymentsRes] = await Promise.all([
          fetch(`/api/rent?month=${monthKey}`),
          fetch("/api/members"),
          fetch("/api/meals"),
          fetch("/api/bazar"),
          fetch("/api/payments"),
        ]);

        if (rentRes.ok) {
          const data = await rentRes.json();
          if (data) {
            setRentBill({
              roomRent: Number(data.roomRent || 0),
              wifiBill: Number(data.wifiBill || 0),
              buaBill: Number(data.buaBill || 0),
            });
          }
        }

        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(Array.isArray(data) ? data.filter((member: { role?: string }) => member.role !== "admin") : []);
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
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // --- GLOBAL STATS ---
  const totalMembers = stats.totalMembers;
  const currentMonthKey = getLocalMonthKey();

  const monthMeals = useMemo(() => meals.filter((meal) => String((meal as any).date || "").slice(0, 7) === currentMonthKey), [meals, currentMonthKey]);
  const monthBazars = useMemo(() => bazars.filter((bazar) => String((bazar as any).date || "").slice(0, 7) === currentMonthKey), [bazars, currentMonthKey]);
  const monthPayments = useMemo(() => payments.filter((payment) => {
    if ((payment as any).status !== "completed") return false;
    const monthFromPaidDate = (payment as any).paidDate ? String((payment as any).paidDate).slice(0, 7) : "";
    const monthKey = (payment as any).monthKey || monthFromPaidDate;
    return monthKey === currentMonthKey;
  }), [payments, currentMonthKey]);

  const totalBazar = monthBazars.reduce((sum, bazar) => {
    const amount = typeof bazar.total === "number"
      ? bazar.total
      : Number(bazar.quantity || 0) * Number(bazar.price || 0);
    return sum + amount;
  }, 0);

  const totalMeals = monthMeals.reduce((sum, meal) => sum + Number(meal.total || 0), 0);
  const mealRate = totalMeals > 0 ? (totalBazar / totalMeals).toFixed(2) : "0.00";

  // --- PERSONAL ACCOUNTING ---
  const totalRent = rentBill.roomRent + rentBill.wifiBill + rentBill.buaBill;

  const getIdFromRef = (ref: { _id?: string } | string | null | undefined): string => {
    if (!ref) return "";
    if (typeof ref === "string") return ref;
    return ref._id || "";
  };

  const mealsByMember = useMemo(() => {
    return monthMeals.reduce((acc, meal) => {
      const memberId = getIdFromRef(meal.memberId as { _id?: string } | string | null);
      if (!memberId) return acc;
      acc[memberId] = (acc[memberId] || 0) + Number(meal.total || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [monthMeals]);

  const bazarsByMember = useMemo(() => {
    return monthBazars.reduce((acc, bazar) => {
      const memberId = getIdFromRef(bazar.memberId);
      if (!memberId) return acc;
      const amount = typeof bazar.total === "number"
        ? bazar.total
        : Number(bazar.quantity || 0) * Number(bazar.price || 0);
      acc[memberId] = (acc[memberId] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  }, [monthBazars]);

  const paidMemberIds = useMemo(() => {
    const ids = new Set<string>();
    monthPayments.forEach((payment) => {
      const memberId = getIdFromRef(payment.memberId);
      if (memberId) ids.add(memberId);
    });
    return ids;
  }, [monthPayments]);

  const getMemberBalance = (memberId: string): number => {
    const mealCost = (mealsByMember[memberId] || 0) * Number(mealRate || 0);
    const giveTake = mealCost - (bazarsByMember[memberId] || 0);
    return totalRent + giveTake;
  };

  const currentMember = members.find((member) => member._id && member._id === (userData as any)._id)
    || members.find((member) => member._id && (userData.username || "").toLowerCase() === (member as any).username?.toLowerCase());

  const currentMemberId = userData.role === "admin" ? "" : (currentMember?._id || "");
  const currentMemberBalance = currentMemberId ? getMemberBalance(currentMemberId) : 0;
  const currentMemberPaid = currentMemberId
    ? monthPayments.reduce((sum, payment) => {
        const paymentMemberId = getIdFromRef(payment.memberId);
        if (paymentMemberId !== currentMemberId) return sum;
        return sum + Number(payment.amount || 0);
      }, 0)
    : 0;
  const currentMemberHasPaid = currentMemberId ? currentMemberBalance <= 0 || currentMemberPaid >= currentMemberBalance : false;

  const myPaid = useMemo(() => {
    return members
      .filter((member) => paidMemberIds.has(member._id))
      .reduce((sum, member) => sum + getMemberBalance(member._id), 0);
  }, [members, paidMemberIds, mealsByMember, bazarsByMember, mealRate, totalRent]);
  
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  const isLastDay = nextDay.getMonth() !== today.getMonth();

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes floatBtn {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        .move-card:hover {
          animation: floatBtn 0.3s ease forwards;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.5) !important;
          cursor: pointer;
        }
      `}</style>

      <main style={styles.mainContent}>
        {/* UPDATED HEADER: User profile box removed */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.welcomeText}>
              {userData.isNew ? "Welcome, " : "Welcome back, "}{userData.username}!
            </h1>
            <p style={styles.subText}>
              {isLastDay ? "Month-end calculation is ready." : "Next calculation: Last day of the month."}
            </p>
          </div>
        </header>

        <div style={styles.banner}>
          <div style={styles.bannerInfo}>
            <div style={styles.bannerIcon}><User color="#fff" /></div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Current Manager</p>
              <h3 style={{ margin: 0 }}>
                {userData.role === "admin" ? userData.username : "Admin"}
              </h3>
            </div>
          </div>
        </div>

        <div style={styles.balanceCard} className="move-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "80px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Total Rent</p>
                <h2 style={{ fontSize: "36px", fontWeight: "bold", margin: "8px 0", color: "#f8fafc" }}>
                  ৳{totalRent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Room Rent: ৳{rentBill.roomRent.toFixed(2)}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Wifi Bill: ৳{rentBill.wifiBill.toFixed(2)}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Rannar Maasi/Bua: ৳{rentBill.buaBill.toFixed(2)}</span>
                </div>
              </div>
              {userData.role === "admin" ? (
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Total Paid</p>
                  <h2 style={{ fontSize: "36px", fontWeight: "bold", margin: "8px 0", color: "#10b981" }}>
                    ৳{myPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </h2>
                </div>
              ) : (
                <div style={{ maxWidth: "320px", textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Payment Status</p>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "8px 0", color: currentMemberHasPaid ? "#10b981" : "#f59e0b" }}>
                    {currentMemberHasPaid ? "Thank you for your monthly payment." : `Your monthly balance is ৳${currentMemberBalance.toFixed(2)}`}
                  </h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>
                    {currentMemberHasPaid ? "Your balance is already cleared." : "Please clear your balance when possible."}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.balanceActionIcon}>
            <ArrowUpRight size={28} color="#fff" />
          </div>
        </div>

        <div style={styles.statsGrid}>
          <StatCard title="Total Members" value={totalMembers.toString()} icon={<Users color="#3b82f6" />} />
          <StatCard title="Total Meals" value={totalMeals.toString()} icon={<Utensils color="#10b981" />} />
          <StatCard title="Total Bazar" value={`৳${totalBazar}`} icon={<ShoppingCart color="#f59e0b" />} />
          <StatCard title="Meal Rate" value={`৳${mealRate}`} icon={<TrendingUp color="#8b5cf6" />} />
        </div>
        <div style={{ marginTop: 24 }}>
          <RulesCard />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div style={styles.card} className="move-card">
      <div>
        <p style={styles.cardTitle}>{title}</p>
        <h2 style={styles.cardValue}>{value}</h2>
      </div>
      <div style={styles.cardIcon}>{icon}</div>
    </div>
  );
}

function RulesCard() {
  const rules = [
    "Members must pay their dues before the monthly deadline.",
    "Meal entries cannot be edited after the day ends without valid reason.",
    "Every member is responsible for checking their own balance regularly.",
    "Monthly calculations will be finalized at the end of the month.",
    "After monthly restart, previous month data cannot be changed.",
    "Members must inform the manager before leaving the mess for multiple days.",
    "All market expenses must include: amount, date, description.",
    "Personal expenses cannot be added to shared mess expenses.",
    "Missed meals will be counted as zero.",
    "Half meals are allowed.",
    "Maintain cleanliness in shared areas.",
    "Respect all mess members.",
    "Noise after quiet hours is prohibited.",
    "Damage to mess property must be compensated.",
  ];

  return (
    <div style={styles.rulesContainer} className="move-card">
      <h3 style={styles.ruleTitle}>Mess Rules & Guidelines</h3>
      <ol style={styles.ruleList}>
        {rules.map((r, i) => (
          <li key={i} style={styles.ruleItem}>{r}</li>
        ))}
      </ol>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: "flex", background: "transparent", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  mainContent: { flex: 1, padding: "20px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "30px" },
  welcomeText: { fontSize: "28px", fontWeight: "bold", margin: 0 },
  subText: { color: "#94a3b8", margin: "5px 0 0 0" },
  banner: { background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", padding: "24px", borderRadius: "20px", marginBottom: "20px" },
  bannerInfo: { display: "flex", alignItems: "center", gap: "16px" },
  bannerIcon: { background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "14px" },
  balanceCard: {
    background: "rgba(255,255,255,0.03)",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.05)",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  balanceActionIcon: {
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    padding: "15px",
    borderRadius: "18px",
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)"
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  card: { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "0.3s" },
  cardTitle: { color: "#94a3b8", margin: 0, fontSize: "14px" },
  cardValue: { margin: "5px 0 0 0", fontSize: "24px", fontWeight: "bold" },
  cardIcon: { background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" },
  rulesContainer: { background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", marginTop: "16px" },
  ruleTitle: { margin: 0, marginBottom: "8px", fontSize: "16px", color: "#e6edf3" },
  ruleList: { margin: 0, paddingLeft: "18px", color: "#cbd5e1", lineHeight: 1.6 },
  ruleItem: { marginBottom: "6px", fontSize: "14px" },
};