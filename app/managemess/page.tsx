"use client";
import React, { useState, useEffect } from "react";
import { 
  Utensils, ShoppingCart, Wallet, TrendingUp, CalendarDays, 
  Edit3, Trash2, Plus, Save, X, User as UserIcon
} from "lucide-react";

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
  quantity: number;
  price: number;
  total: number;
  date: string;
  memberId: { _id: string; username: string };
}

interface Member {
  _id: string;
  username: string;
}

export default function ManageMess() {
  // --- 1. USER & DATA STATE ---
  const [userData, setUserData] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bazars, setBazars] = useState<Bazar[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 2. TAB & MODAL STATE ---
  const [activeTab, setActiveTab] = useState("Meals");
  const [showMealModal, setShowMealModal] = useState(false);
  const [showBazarModal, setShowBazarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- 3. FORM STATES ---
  const [mealForm, setMealForm] = useState({
    memberId: "",
    date: selectedDate,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    mealType: "own" as 'own' | 'guest',
  });

  const [bazarForm, setBazarForm] = useState({
    memberId: "",
    date: selectedDate,
    item: "",
    quantity: 1,
    unit: "kg",
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, mealsRes, bazarsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/meals"),
        fetch("/api/bazar")
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());
      if (mealsRes.ok) setMeals(await mealsRes.json());
      if (bazarsRes.ok) setBazars(await bazarsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
        if (response.ok) await fetchData();
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
        setShowBazarModal(false);
        setBazarForm({ memberId: "", date: selectedDate, item: "", quantity: 1, unit: "kg", price: 0, category: "groceries" });
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
        if (response.ok) await fetchData();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // --- 7. FILTER HELPERS ---
  const todaysMeals = meals.filter((m) => m.date.startsWith(selectedDate));
  const todaysBazars = bazars.filter((b) => b.date.startsWith(selectedDate));
  const totalMealsToday = todaysMeals.reduce((sum, m) => sum + m.total, 0);
  const totalBazarToday = todaysBazars.reduce((sum, b) => sum + (b.quantity * b.price), 0);

  // --- 8. CALCULATE STATS ---
  const stats = [
    { title: "Total Meals Today", value: totalMealsToday.toFixed(1), icon: <Utensils color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
    { title: "Total Bazar Today", value: `৳${totalBazarToday.toFixed(0)}`, icon: <ShoppingCart color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
    { title: "Own Meals", value: todaysMeals.filter((m) => m.mealType === "own").length, icon: <UserIcon color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
    { title: "Guest Meals", value: todaysMeals.filter((m) => m.mealType === "guest").length, icon: <Utensils color="#fff" />, color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
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
        {["Meals", "Bazar"].map((tab) => (
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
                setBazarForm({ memberId: "", date: selectedDate, item: "", quantity: 1, unit: "kg", price: 0, category: "groceries" });
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
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Price</th>
                        <th style={{...styles.th, textAlign: "right"}}>Total</th>
                        <th style={{...styles.th, textAlign: "center"}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysBazars.map((bazar) => (
                        <tr key={bazar._id} style={styles.tableRow}>
                          <td style={styles.td}>{bazar.memberId.username}</td>
                          <td style={styles.td}>{bazar.item}</td>
                          <td style={styles.td}>{bazar.quantity}</td>
                          <td style={styles.td}>৳{bazar.price.toFixed(2)}</td>
                          <td style={{...styles.td, fontWeight: "bold", textAlign: "right"}}>৳{(bazar.quantity * bazar.price).toFixed(2)}</td>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    onClick={() => setMealForm({ ...mealForm, mealType: "own" })}
                    style={{...styles.mealTypeBtn, background: mealForm.mealType === "own" ? "#3b82f6" : "rgba(59, 130, 246, 0.2)", color: mealForm.mealType === "own" ? "#fff" : "#3b82f6"}}
                  >
                    Own Meal
                  </button>
                  <button
                    onClick={() => setMealForm({ ...mealForm, mealType: "guest" })}
                    style={{...styles.mealTypeBtn, background: mealForm.mealType === "guest" ? "#6b7280" : "rgba(107, 114, 128, 0.2)", color: mealForm.mealType === "guest" ? "#fff" : "#6b7280"}}
                  >
                    Guest Meal
                  </button>
                </div>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={bazarForm.quantity}
                    onChange={(e) => setBazarForm({ ...bazarForm, quantity: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Unit</label>
                  <select
                    value={bazarForm.unit}
                    onChange={(e) => setBazarForm({ ...bazarForm, unit: e.target.value })}
                    style={styles.input}
                  >
                    <option value="kg">KG</option>
                    <option value="liter">Liter</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price (৳)*</label>
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