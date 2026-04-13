"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, Utensils, ShoppingCart, TrendingUp, ArrowUpRight, User 
} from "lucide-react";

export default function Dashboard() {
  const [userData, setUserData] = useState({ username: "Guest", role: "other", isNew: false });

  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  // --- GLOBAL STATS ---
  const totalMembers = userData.role === "admin" ? 1 : 27; 
  const totalBazar = 0;
  const totalMeals = 0;
  const mealRate = totalMeals > 0 ? (totalBazar / totalMeals).toFixed(2) : "0.00";

  // --- PERSONAL ACCOUNTING ---
  const myMeals = 0; 
  const myPaid = 0;   
  const fixedBills = 2150 + 180 + 450; 
  
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  const isLastDay = nextDay.getMonth() !== today.getMonth();

  const myExpense = isLastDay && myMeals > 0 
    ? (parseFloat(mealRate) * myMeals) + fixedBills 
    : 0; 

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

      {/* Sidebar removed so it doesn't double up with the layout */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.welcomeText}>
              {userData.isNew ? "Welcome, " : "Welcome back, "}{userData.username}!
            </h1>
            <p style={styles.subText}>
              {isLastDay ? "Month-end calculation is ready." : "Next calculation: Last day of the month."}
            </p>
          </div>
          <div style={styles.userProfile} className="move-card">
            <div style={styles.avatar}>{userData.username.charAt(0).toUpperCase()}</div>
            <span>{userData.username}</span>
          </div>
        </header>

        <div style={styles.banner}>
          <div style={styles.bannerInfo}>
            <div style={styles.bannerIcon}><User color="#fff" /></div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Current Manager</p>
              <h3 style={{ margin: 0 }}>
                {userData.role === "admin" ? userData.username : "Mahmudul Hassan Abin"}
              </h3>
            </div>
          </div>
        </div>

        <div style={styles.balanceCard} className="move-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "80px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>My Expenses</p>
                <h2 style={{ fontSize: "36px", fontWeight: "bold", margin: "8px 0", color: "#f8fafc" }}>
                  ৳{myExpense.toLocaleString()}
                </h2>
                {!isLastDay && <span style={{fontSize: '11px', color: '#6366f1'}}>Calculates on month-end</span>}
              </div>
              
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Total Paid</p>
                <h2 style={{ fontSize: "36px", fontWeight: "bold", margin: "8px 0", color: "#10b981" }}>
                  ৳{myPaid.toLocaleString()}
                </h2>
              </div>
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

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: "flex", background: "transparent", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  mainContent: { flex: 1, padding: "20px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  welcomeText: { fontSize: "28px", fontWeight: "bold", margin: 0 },
  subText: { color: "#94a3b8", margin: "5px 0 0 0" },
  userProfile: { display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "30px", border: "1px solid transparent" },
  avatar: { width: "32px", height: "32px", background: "#475569", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" },
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
};