"use client";
import React, { useState, useEffect } from "react";
import { 
  Utensils, ShoppingCart, Wallet, TrendingUp, CalendarDays, 
  Edit3, Trash2, Plus, Save, X, User as UserIcon
} from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

interface Meal {
  _id: string;
  memberId: { _id: string; username: string };
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
  mealType: 'guest' | 'own';
}

interface Bazar {
  _id: string;
  item: string;
  price: number;
  quantity?: number;
  total?: number;
  date: string;
  memberId: { _id: string; username: string };
}

interface Member {
  _id: string;
  username: string;
}

interface Payment {
  _id: string;
  memberId: { _id: string; username: string };
  amount: number;
  paidDate: string;
  monthKey: string;
  status: string;
}

interface RentBill {
  _id?: string;
  monthKey: string;
  roomRent: number;
  wifiBill: number;
  buaBill: number;
}

export default function ManageMess() {
  const { stats: globalStats, refreshStats } = useGlobalStats();
  // --- 1. USER & DATA STATE ---
  const [userData, setUserData] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bazars, setBazars] = useState<Bazar[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentChecks, setPaymentChecks] = useState<Record<string, boolean>>({});
  const [rentBill, setRentBill] = useState<RentBill>({
    monthKey: "",
    roomRent: 0,
    wifiBill: 0,
    buaBill: 0,
  });
  const [savingRent, setSavingRent] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- 2. TAB & MODAL STATE ---
  const [activeTab, setActiveTab] = useState("Meals");
  const [showMealModal, setShowMealModal] = useState(false);
  const [showBazarModal, setShowBazarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const selectedMonth = selectedDate.slice(0, 7);

  // --- 3. FORM STATES ---
  const [mealForm, setMealForm] = useState({
    memberId: "",
    date: selectedDate,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    mealType: "own" as 'own',
  });

  const [bazarForm, setBazarForm] = useState({
    memberId: "",
    date: selectedDate,
    item: "",
    price: 0,
    category: "groceries",
  });

  // --- 4. FETCH DATA ON MOUNT ---
  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      setUserData(JSON.parse(saved));
    }
    fetchData();
  }, []);

  useEffect(() => {
    fetchRentBill();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, mealsRes, bazarsRes, paymentsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/meals"),
        fetch("/api/bazar"),
        fetch("/api/payments")
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());
      if (mealsRes.ok) setMeals(await mealsRes.json());
      if (bazarsRes.ok) setBazars(await bazarsRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRentBill = async () => {
    try {
      const response = await fetch(`/api/rent?month=${selectedMonth}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data) {
        setRentBill({
          monthKey: data.monthKey || selectedMonth,
          roomRent: Number(data.roomRent || 0),
          wifiBill: Number(data.wifiBill || 0),
          buaBill: Number(data.buaBill || 0),
        });
      } else {
        setRentBill({ monthKey: selectedMonth, roomRent: 0, wifiBill: 0, buaBill: 0 });
      }
    } catch (error) {
      console.error("Error fetching rent bill:", error);
    }
  };

  const handleSaveRentBill = async () => {
    if (userData?.role !== "admin") {
      alert("Only admin can edit rent bills.");
      return;
    }

    setSavingRent(true);
    try {
      const response = await fetch("/api/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: selectedMonth,
          roomRent: rentBill.roomRent,
          wifiBill: rentBill.wifiBill,
          buaBill: rentBill.buaBill,
          updatedBy: userData?.username || "admin",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || "Failed to save rent bills.");
        return;
      }

      setRentBill({
        monthKey: data.monthKey || selectedMonth,
        roomRent: Number(data.roomRent || 0),
        wifiBill: Number(data.wifiBill || 0),
        buaBill: Number(data.buaBill || 0),
      });
      alert("Rent bills updated successfully.");
    } catch (error) {
      console.error("Error saving rent bills:", error);
      alert("Failed to save rent bills.");
    } finally {
      setSavingRent(false);
    }
  };

  // --- 5. MEAL HANDLERS ---
  const handleAddMeal = async () => {
    if (!mealForm.memberId || !mealForm.date) {
      alert("Please select member and date");
      return;
    }

    const payload = {
      ...mealForm,
      date: new Date(mealForm.date),
    };

    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchData();
        refreshStats();
        setShowMealModal(false);
        setMealForm({ memberId: "", date: selectedDate, breakfast: 0, lunch: 0, dinner: 0, mealType: "own" });
      } else {
        alert("Error adding meal");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (confirm("Delete this meal record?")) {
      try {
        const response = await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
        if (response.ok) {
          await fetchData();
          refreshStats();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // --- 6. BAZAR HANDLERS ---
  const handleAddBazar = async () => {
    if (!bazarForm.memberId || !bazarForm.item || !bazarForm.price) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...bazarForm,
      quantity: 1,
      unit: "piece",
      date: new Date(bazarForm.date),
    };

    try {
      const response = await fetch("/api/bazar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchData();
        refreshStats();
        setShowBazarModal(false);
        setBazarForm({ memberId: "", date: selectedDate, item: "", price: 0, category: "groceries" });
      } else {
        alert("Error adding bazar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteBazar = async (id: string) => {
    if (confirm("Delete this bazar entry?")) {
      try {
        const response = await fetch(`/api/bazar?id=${id}`, { method: "DELETE" });
        if (response.ok) {
          await fetchData();
          refreshStats();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // --- 7. FILTER HELPERS ---
  const monthMeals = meals.filter((m) => m.date.startsWith(selectedMonth));
  const monthBazars = bazars.filter((b) => b.date.startsWith(selectedMonth));
  const totalMonthMeals = monthMeals.reduce((sum, m) => sum + (m.total || 0), 0);
  const totalMonthBazar = monthBazars.reduce((sum, b) => sum + (typeof b.total === "number" ? b.total : b.price), 0);
  const monthlyMealRate = totalMonthMeals > 0 ? totalMonthBazar / totalMonthMeals : 0;
  const getBazarMemberId = (memberRef: Bazar["memberId"]): string => {
    if (typeof memberRef === "string") return memberRef;
    return memberRef?._id || "";
  };

  const getBazarAmount = (bazar: Bazar): number => {
    if (typeof bazar.total === "number" && Number.isFinite(bazar.total)) {
      return bazar.total;
    }
    return Number(bazar.quantity || 0) * Number(bazar.price || 0);
  };

  const mealsByMember = meals.reduce((acc, meal) => {
    const memberId = meal.memberId?._id;
    if (!memberId) return acc;
    acc[memberId] = (acc[memberId] || 0) + (meal.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const bazarsByMember = bazars.reduce((acc, bazar) => {
    const memberId = getBazarMemberId(bazar.memberId);
    if (!memberId) return acc;
    acc[memberId] = (acc[memberId] || 0) + getBazarAmount(bazar);
    return acc;
  }, {} as Record<string, number>);

  const totalRent = Number(rentBill.roomRent || 0) + Number(rentBill.wifiBill || 0) + Number(rentBill.buaBill || 0);

  const getGiveTakeValue = (memberId: string): number => {
    const mealCost = (mealsByMember[memberId] || 0) * globalStats.mealRate;
    const memberBazar = bazarsByMember[memberId] || 0;
    return mealCost - memberBazar;
  };

  const monthlyPaidMemberIds = new Set(
    payments
      .filter((p) => {
        if (p.status !== "completed") return false;
        const paidMonth = p.paidDate ? p.paidDate.slice(0, 7) : "";
        return p.monthKey === selectedMonth || paidMonth === selectedMonth;
      })
      .map((p) => p.memberId?._id)
  );

  const todaysMeals = meals.filter((m) => m.date.startsWith(selectedDate));
  const todaysBazars = bazars.filter((b) => b.date.startsWith(selectedDate));
  const totalMealsToday = todaysMeals.reduce((sum, m) => sum + m.total, 0);
  const totalBazarToday = todaysBazars.reduce((sum, b) => sum + (typeof b.total === "number" ? b.total : b.price), 0);

  const monthlyExpenseRows = members.map((member) => {
    const monthlyExpense = totalRent + getGiveTakeValue(member._id);
    return {
      member,
      monthlyExpense,
      isPaid: monthlyPaidMemberIds.has(member._id),
    };
  });

  const handleConfirmMonthlyPayment = async (memberId: string, amount: number) => {
    if (!paymentChecks[memberId]) {
      alert("Tick the confirm box first.");
      return;
    }

    if (amount <= 0) {
      alert("Total balance is 0 for this member.");
      return;
    }

    if (!confirm("Confirm monthly expense payment for this member?")) {
      return;
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount,
          date: selectedDate,
          monthKey: selectedMonth,
          description: `Monthly expense payment for ${selectedMonth}`,
          paymentMethod: "cash",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || "Failed to confirm payment.");
        return;
      }

      setPaymentChecks((prev) => ({ ...prev, [memberId]: false }));
      await fetchData();
      refreshStats();
      alert("Payment marked as completed.");
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment.");
    }
  };

  // --- 8. CALCULATE STATS ---
  const stats = [
    { title: "Total Meals Today", value: totalMealsToday.toFixed(1), icon: <Utensils color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
    { title: "Total Bazar Today", value: `৳${totalBazarToday.toFixed(0)}`, icon: <ShoppingCart color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
    { title: "Total Members", value: globalStats.totalMembers, icon: <UserIcon color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
    { title: "All-Time Meals", value: globalStats.totalMeals.toFixed(1), icon: <Utensils color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
  ];

  if (loading) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <h1 style={styles.title}>Manage Mess</h1>
        <div style={styles.banner}>
          <CalendarDays size={18} color="#fff" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "6px 12px", borderRadius: "8px", color: "#fff", cursor: "pointer" }}
          />
          <span style={styles.changeTerm}>{userData?.username || "User"}</span>
        </div>
      </header>

      {/* STATS SECTION */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={{...styles.statCard, background: stat.color}}>
            <div>
              <p style={styles.statLabelLight}>{stat.title}</p>
              <h2 style={styles.statValue}>{stat.value}</h2>
            </div>
            <div style={styles.iconBoxGlass}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* TAB NAVIGATION */}
      <div style={styles.tabBar}>
        {["Meals", "Bazar", "Payments", "Rent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.inactiveTab}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT BOX */}
      <div style={styles.mainContentBox}>
        
        {/* VIEW: MEALS */}
        {activeTab === "Meals" && (
          <>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Daily Meal Entry</h3>
                <p style={styles.sectionSubTitle}>Add meals for members (Own or Guest)</p>
              </div>
              <button style={styles.btnAddMeal} onClick={() => {
                setMealForm({ memberId: "", date: selectedDate, breakfast: 0, lunch: 0, dinner: 0, mealType: "own" });
                setShowMealModal(true);
              }}>
                <Plus size={16} /> Add Meal
              </button>
            </div>

            {todaysMeals.length > 0 ? (
              <div style={{ overflowX: "auto", borderRadius: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Member</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>B</th>
                      <th style={styles.th}>L</th>
                      <th style={styles.th}>D</th>
                      <th style={{...styles.th, textAlign: "right"}}>Total</th>
                      <th style={{...styles.th, textAlign: "center"}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysMeals.map((meal) => (
                      <tr key={meal._id} style={styles.tableRow}>
                        <td style={styles.td}>{meal.memberId.username}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: meal.mealType === "own" ? "rgba(59, 130, 246, 0.2)" : "rgba(107, 114, 128, 0.2)",
                            color: meal.mealType === "own" ? "#3b82f6" : "#d1d5db"
                          }}>
                            {meal.mealType === "own" ? "Own" : "Guest"}
                          </span>
                        </td>
                        <td style={styles.td}>{meal.breakfast}</td>
                        <td style={styles.td}>{meal.lunch}</td>
                        <td style={styles.td}>{meal.dinner}</td>
                        <td style={{...styles.td, fontWeight: "bold", textAlign: "right"}}>{meal.total}</td>
                        <td style={{...styles.td, textAlign: "center"}}>
                          <button
                            onClick={() => handleDeleteMeal(meal._id)}
                            style={{
                              background: "#1e293b",
                              border: "1px solid #334155",
                              color: "#ef4444",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Utensils size={40} color="#475569" />
                <p>No meal records for today.</p>
              </div>
            )}
          </>
        )}

        {/* VIEW: BAZAR */}
        {activeTab === "Bazar" && (
          <>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Bazar + Related Meals</h3>
              <button style={styles.btnAddBazar} onClick={() => {
                setBazarForm({ memberId: "", date: selectedDate, item: "", price: 0, category: "groceries" });
                setShowBazarModal(true);
              }}>
                <Plus size={16} /> Add Bazar
              </button>
            </div>

            {todaysBazars.length > 0 ? (
              <>
                <h4 style={{ color: "#cbd5e1", marginTop: "20px", marginBottom: "15px" }}>Bazar Entries:</h4>
                <div style={{ overflowX: "auto", borderRadius: "12px", marginBottom: "30px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Member</th>
                        <th style={styles.th}>Item</th>
                        <th style={{...styles.th, textAlign: "right"}}>Price</th>
                        <th style={{...styles.th, textAlign: "center"}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysBazars.map((bazar) => (
                        <tr key={bazar._id} style={styles.tableRow}>
                          <td style={styles.td}>{bazar.memberId.username}</td>
                          <td style={styles.td}>{bazar.item}</td>
                          <td style={{...styles.td, fontWeight: "bold", textAlign: "right"}}>৳{(typeof bazar.total === "number" ? bazar.total : bazar.price).toFixed(2)}</td>
                          <td style={{...styles.td, textAlign: "center"}}>
                            <button
                              onClick={() => handleDeleteBazar(bazar._id)}
                              style={{
                                background: "#1e293b",
                                border: "1px solid #334155",
                                color: "#ef4444",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ color: "#cbd5e1", marginTop: "20px", marginBottom: "15px" }}>Meals for Today (Related to this Bazar):</h4>
                {todaysMeals.length > 0 ? (
                  <div style={{ overflowX: "auto", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>Member</th>
                          <th style={styles.th}>Type</th>
                          <th style={styles.th}>B</th>
                          <th style={styles.th}>L</th>
                          <th style={styles.th}>D</th>
                          <th style={{...styles.th, textAlign: "right"}}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysMeals.map((meal) => (
                          <tr key={meal._id} style={styles.tableRow}>
                            <td style={styles.td}>{meal.memberId.username}</td>
                            <td style={styles.td}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: meal.mealType === "own" ? "rgba(59, 130, 246, 0.2)" : "rgba(107, 114, 128, 0.2)",
                                color: meal.mealType === "own" ? "#3b82f6" : "#d1d5db"
                              }}>
                                {meal.mealType === "own" ? "Own" : "Guest"}
                              </span>
                            </td>
                            <td style={styles.td}>{meal.breakfast}</td>
                            <td style={styles.td}>{meal.lunch}</td>
                            <td style={styles.td}>{meal.dinner}</td>
                            <td style={{...styles.td, fontWeight: "bold", textAlign: "right"}}>{meal.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: "#64748b" }}>No meals recorded for today yet.</p>
                )}
              </>
            ) : (
              <div style={styles.emptyState}>
                <ShoppingCart size={40} color="#475569" />
                <p>No bazar entries found. Click "Add Bazar" to start.</p>
              </div>
            )}
          </>
        )}

        {/* VIEW: PAYMENTS */}
        {activeTab === "Payments" && (
          <>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Monthly Payment Confirmation</h3>
                <p style={styles.sectionSubTitle}>
                  Mark members as paid for {selectedMonth} after confirming each monthly expense.
                </p>
              </div>
              <div style={styles.dateBadge}>
                <Wallet size={16} color="#22c55e" />
                <span>Meal Rate: ৳{monthlyMealRate.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ overflowX: "auto", borderRadius: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Member</th>
                    <th style={styles.th}>Total Expense (Balance)</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Confirm</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenseRows.map((row) => (
                    <tr key={row.member._id} style={styles.tableRow}>
                      <td style={styles.td}>{selectedDate}</td>
                      <td style={styles.td}>{row.member.username}</td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>৳{row.monthlyExpense.toFixed(2)}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={row.isPaid || !!paymentChecks[row.member._id]}
                          disabled={row.isPaid}
                          onChange={(e) =>
                            setPaymentChecks((prev) => ({
                              ...prev,
                              [row.member._id]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {row.isPaid ? (
                          <span style={styles.paidBadge}>Paid</span>
                        ) : (
                          <button
                            style={styles.btnConfirmPayment}
                            onClick={() => handleConfirmMonthlyPayment(row.member._id, row.monthlyExpense)}
                          >
                            Confirm Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* VIEW: RENT */}
        {activeTab === "Rent" && (
          <>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Monthly Rent & Utility Bills</h3>
                <p style={styles.sectionSubTitle}>Edit Room Rent, Wifi Bill and Rannar Maasi/Bua bill for {selectedMonth}</p>
              </div>
              <div style={styles.dateBadge}>
                <Wallet size={16} color="#22c55e" />
                <span>Total: ৳{(rentBill.roomRent + rentBill.wifiBill + rentBill.buaBill).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Room Rent</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rentBill.roomRent}
                  disabled={userData?.role !== "admin"}
                  onChange={(e) => setRentBill((prev) => ({ ...prev, roomRent: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Wifi Bill</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rentBill.wifiBill}
                  disabled={userData?.role !== "admin"}
                  onChange={(e) => setRentBill((prev) => ({ ...prev, wifiBill: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Rannar Maasi/Bua Bill</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rentBill.buaBill}
                  disabled={userData?.role !== "admin"}
                  onChange={(e) => setRentBill((prev) => ({ ...prev, buaBill: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>
            </div>

            {userData?.role === "admin" ? (
              <button style={{ ...styles.btnSaveGradient, width: "fit-content" }} onClick={handleSaveRentBill} disabled={savingRent}>
                <Save size={16} /> {savingRent ? "Saving..." : "Save Rent Bills"}
              </button>
            ) : (
              <p style={{ color: "#94a3b8", margin: 0 }}>Only admin can edit rent bills.</p>
            )}
          </>
        )}
      </div>

      {/* --- MODAL: ADD MEAL --- */}
      {showMealModal && (
        <div style={styles.modalOverlay} onClick={() => setShowMealModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Meal</h3>
              <button style={styles.btnCloseModal} onClick={() => setShowMealModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Member*</label>
                <select
                  value={mealForm.memberId}
                  onChange={(e) => setMealForm({ ...mealForm, memberId: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select Member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.username}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Meal Type*</label>
                <button
                  onClick={() => setMealForm({ ...mealForm, mealType: "own" })}
                  style={{...styles.mealTypeBtn, width: "100%", background: "#3b82f6", color: "#fff", cursor: "default"}}
                  disabled
                >
                  Own Meal
                </button>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Date*</label>
                <input
                  type="date"
                  value={mealForm.date}
                  onChange={(e) => setMealForm({ ...mealForm, date: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Breakfast</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={mealForm.breakfast}
                    onChange={(e) => setMealForm({ ...mealForm, breakfast: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Lunch</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={mealForm.lunch}
                    onChange={(e) => setMealForm({ ...mealForm, lunch: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Dinner</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={mealForm.dinner}
                  onChange={(e) => setMealForm({ ...mealForm, dinner: parseFloat(e.target.value) || 0 })}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowMealModal(false)}>Cancel</button>
              <button style={styles.btnSaveGradient} onClick={handleAddMeal}>
                <Save size={16}/> Save Meal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD BAZAR --- */}
      {showBazarModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBazarModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Bazar</h3>
              <button style={styles.btnCloseModal} onClick={() => setShowBazarModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Member*</label>
                <select
                  value={bazarForm.memberId}
                  onChange={(e) => setBazarForm({ ...bazarForm, memberId: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select Member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Date*</label>
                <input
                  type="date"
                  value={bazarForm.date}
                  onChange={(e) => setBazarForm({ ...bazarForm, date: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Item*</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken"
                  value={bazarForm.item}
                  onChange={(e) => setBazarForm({ ...bazarForm, item: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Final Price (৳)*</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bazarForm.price}
                  onChange={(e) => setBazarForm({ ...bazarForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowBazarModal(false)}>Cancel</button>
              <button style={styles.btnSaveGradient} onClick={handleAddBazar}>
                <Save size={16}/> Save Bazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "30px", color: "#f8fafc", minHeight: "100vh" },
  header: { marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "bold", margin: 0 },
  banner: { 
    display: "flex", alignItems: "center", gap: "10px", 
    background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", 
    padding: "12px 20px", borderRadius: "12px", marginTop: "15px", width: "fit-content" 
  },
  termText: { color: "#fff", fontWeight: "500", fontSize: "14px" },
  changeTerm: { color: "rgba(255,255,255,0.7)", fontSize: "12px", cursor: "pointer", marginLeft: "20px" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { padding: "20px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" },
  statLabelLight: { margin: 0, fontSize: "12px", opacity: 0.8, textTransform: "uppercase" },
  statValue: { margin: "5px 0 0 0", fontSize: "28px", fontWeight: "bold" },
  iconBoxGlass: { background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" },

  tabBar: { display: "flex", gap: "10px", marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" },
  inactiveTab: { background: "transparent", border: "none", color: "#64748b", padding: "10px 20px", cursor: "pointer", fontSize: "14px" },
  activeTab: { background: "rgba(99, 102, 241, 0.1)", border: "none", color: "#818cf8", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },

  mainContentBox: { background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "24px", minHeight: "400px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  sectionTitle: { color: "#f8fafc", margin: 0, fontSize: "18px" },
  sectionSubTitle: { color: "#64748b", margin: "5px 0 0 0", fontSize: "14px" },
  dateBadge: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "10px", color: "#cbd5e1", fontSize: "14px" },
  
  btnAddMeal: { background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" },
  btnAddBazar: { background: "#9a3412", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" },
  btnConfirmPayment: { background: "#16a34a", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  paidBadge: { background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "60px 0", color: "#475569" },
  
  tableHeaderRow: { background: "#1e293b" },
  th: { textAlign: "left", padding: "16px 12px", color: "#94a3b8", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" },
  tableRow: { borderBottom: "1px solid #1e293b" },
  td: { padding: "16px 12px", color: "#cbd5e1", fontSize: "14px" },
  
  mealTypeBtn: { padding: "10px", borderRadius: "8px", border: "1px solid #334155", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "all 0.2s" },

  /* MODAL STYLES */
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalContent: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "20px", width: "90%", maxWidth: "500px", color: "#f8fafc", overflow: "hidden" },
  modalHeader: { padding: "20px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: "700", color: "#f8fafc" },
  btnCloseModal: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer" },
  modalBody: { padding: "20px", display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#cbd5e1" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", outline: "none", fontSize: "14px", color: "#cbd5e1" },
  modalFooter: { padding: "20px", background: "#1e293b", display: "flex", justifyContent: "flex-end", gap: "10px" },
  
  btnSaveGradient: { background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" },
  btnCancel: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: "600", padding: "0 10px" }
};