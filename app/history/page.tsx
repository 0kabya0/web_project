"use client";
import React, { useEffect, useMemo, useState } from "react";
import { History as HistoryIcon, CalendarClock, Boxes, Wallet, UtensilsCrossed } from "lucide-react";

interface ResetHistoryRecord {
  _id: string;
  monthKey: string;
  resetDate: string;
  resetBy: string;
  mealCount: number;
  bazarCount: number;
  paymentCount: number;
  totalMeals: number;
  totalBazar: number;
  totalPayments: number;
  meals: any[];
  bazars: any[];
  payments: any[];
}

export default function HistoryPage() {
  const [userRole, setUserRole] = useState("user");
  const [histories, setHistories] = useState<ResetHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserRole(parsed?.role || "user");
      } catch {
        setUserRole("user");
      }
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/reset-history");
        if (response.ok) {
          const data = await response.json();
          setHistories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching reset history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const isAdmin = userRole === "admin";

  const summary = useMemo(() => {
    return histories.reduce(
      (acc, item) => {
        acc.resets += 1;
        acc.meals += item.mealCount || 0;
        acc.bazars += item.bazarCount || 0;
        acc.payments += item.paymentCount || 0;
        return acc;
      },
      { resets: 0, meals: 0, bazars: 0, payments: 0 }
    );
  }, [histories]);

  if (!loading && !isAdmin) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Reset History</h1>
          <p style={styles.subTitle}>Admin access required.</p>
        </header>
        <div style={styles.noticeCard}>Only admin users can view reset history.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Reset History</h1>
        <p style={styles.subTitle}>See archived month-end data after each reset.</p>
      </header>

      <div style={styles.statsGrid}>
        <StatCard label="Total Resets" value={summary.resets.toString()} icon={<HistoryIcon size={20} color="#fff" />} />
        <StatCard label="Archived Meals" value={summary.meals.toFixed(1)} icon={<UtensilsCrossed size={20} color="#fff" />} />
        <StatCard label="Archived Bazar" value={`৳${summary.bazars.toFixed(0)}`} icon={<Boxes size={20} color="#fff" />} />
        <StatCard label="Archived Payments" value={`৳${summary.payments.toFixed(0)}`} icon={<Wallet size={20} color="#fff" />} />
      </div>

      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Previous Reset Records</h3>
            <p style={styles.sectionSubTitle}>Monthly archives preserved after reset</p>
          </div>
          <div style={styles.badge}><CalendarClock size={14} color="#cbd5e1" /> Archive</div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading history...</div>
        ) : histories.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Month</th>
                  <th style={styles.th}>Reset Date</th>
                  <th style={styles.th}>By</th>
                  <th style={styles.th}>Meals</th>
                  <th style={styles.th}>Bazar</th>
                  <th style={styles.th}>Payments</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Totals</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.tdStrong}>{new Date(`${item.monthKey}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                    <td style={styles.td}>{new Date(item.resetDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{item.resetBy}</td>
                    <td style={styles.td}>{item.mealCount}</td>
                    <td style={styles.td}>{item.bazarCount}</td>
                    <td style={styles.td}>{item.paymentCount}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      Meals ৳{item.totalMeals.toFixed(2)} | Bazar ৳{item.totalBazar.toFixed(2)} | Payments ৳{item.totalPayments.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>No reset history found yet.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={styles.statCard}>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <h2 style={styles.statValue}>{value}</h2>
      </div>
      <div style={styles.iconWrap}>{icon}</div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingBottom: "40px",
    width: "100%",
    boxSizing: "border-box",
    paddingRight: "10px",
    color: "#f8fafc",
    animation: "fadeIn 0.5s",
  },
  header: { marginBottom: "24px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 800, color: "#fff" },
  subTitle: { margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 18px 30px -18px rgba(0,0,0,0.65)",
  },
  statLabel: { margin: 0, color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em" },
  statValue: { margin: "6px 0 0 0", color: "#fff", fontSize: "24px", fontWeight: 800 },
  iconWrap: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  listCard: {
    background: "linear-gradient(180deg, #0f172a 0%, #0b1220 100%)",
    border: "1px solid #1f2937",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 34px -12px rgba(2, 6, 23, 0.65)",
  },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px" },
  sectionTitle: { margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" },
  sectionSubTitle: { margin: "5px 0 0 0", fontSize: "14px", color: "#94a3b8" },
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", fontSize: "12px", fontWeight: 700 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  tableHeadRow: { background: "#1e293b" },
  th: { padding: "14px 12px", textAlign: "left", color: "#94a3b8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #273449" },
  tr: { borderBottom: "1px solid #1f2a3d" },
  td: { padding: "16px 12px", color: "#cbd5e1", fontSize: "14px", verticalAlign: "middle" },
  tdStrong: { padding: "16px 12px", color: "#f8fafc", fontSize: "14px", fontWeight: 700, verticalAlign: "middle" },
  emptyState: { padding: "60px 0", textAlign: "center", color: "#64748b" },
  noticeCard: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "20px", padding: "24px", color: "#cbd5e1" },
};
