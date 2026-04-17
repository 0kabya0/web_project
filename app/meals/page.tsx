"use client";
import React, { useState, useEffect } from "react";
import { Utensils, Users, Filter, Calendar, CheckCircle2, Plus, Trash2, Edit2, X } from "lucide-react";

interface Meal {
  _id: string;
  memberId: { _id: string; username: string; email: string };
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
  mealType: string;
  notes: string;
}

interface Member {
  _id: string;
  username: string;
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState("All Members");
  const [selectedDate, setSelectedDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    memberId: "",
    date: "",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    mealType: "regular",
    notes: "",
  });

  // Fetch meals and members
  useEffect(() => {
    fetchMeals();
    fetchMembers();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meals");
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memberId || !formData.date) {
      alert("Please select member and date");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch("/api/meals", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchMeals();
        resetForm();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "Error saving meal");
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Error saving meal");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meal record?")) {
      try {
        const response = await fetch(`/api/meals?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchMeals();
        }
      } catch (error) {
        console.error("Error deleting meal:", error);
      }
    }
  };

  const handleEdit = (meal: Meal) => {
    setFormData({
      memberId: meal.memberId._id,
      date: meal.date.split("T")[0],
      breakfast: meal.breakfast,
      lunch: meal.lunch,
      dinner: meal.dinner,
      mealType: meal.mealType,
      notes: meal.notes,
    });
    setEditingId(meal._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      memberId: "",
      date: "",
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      mealType: "regular",
      notes: "",
    });
    setEditingId(null);
  };

  // Filter meals
  let filteredMeals = meals;
  if (selectedMember !== "All Members") {
    filteredMeals = filteredMeals.filter(
      (m) => m.memberId.username === selectedMember
    );
  }
  if (selectedDate) {
    filteredMeals = filteredMeals.filter((m) =>
      m.date.startsWith(selectedDate)
    );
  }

  // Calculate stats
  const totalMeals = filteredMeals.reduce((sum, m) => sum + m.total, 0);
  const totalRecords = filteredMeals.length;
  const avgMealsPerRecord = totalRecords > 0 ? (totalMeals / totalRecords).toFixed(1) : "0";

  return (
    <div style={{ animation: "fadeIn 0.5s", color: "#f8fafc", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
      {/* HEADER */}
      <header style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>Meals</h1>
          <p style={{ color: "#94a3b8", marginTop: "5px" }}>Manage meal records</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
          }}
        >
          <Plus size={18} /> Add Meal
        </button>
      </header>

      {/* ADD/EDIT FORM MODAL */}
      {showForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>{editingId ? "Edit Meal" : "Add Meal Record"}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={labelStyle}>Member*</label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select Member</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Date*</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={labelStyle}>Breakfast</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.breakfast}
                    onChange={(e) => setFormData({ ...formData, breakfast: parseFloat(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Lunch</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.lunch}
                    onChange={(e) => setFormData({ ...formData, lunch: parseFloat(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Dinner</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.dinner}
                    onChange={(e) => setFormData({ ...formData, dinner: parseFloat(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={labelStyle}>Meal Type</label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="regular">Regular</option>
                    <option value="special">Special</option>
                    <option value="paid_separately">Paid Separately</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  style={{
                    background: "#1e293b",
                    color: "#94a3b8",
                    border: "1px solid #334155",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div style={statsGridStyle}>
        <div style={statCardGradientStyle}>
          <div>
            <p style={statLabelStyle}>Total Meals</p>
            <h2 style={statValueStyle}>{totalMeals.toFixed(1)}</h2>
          </div>
          <div style={iconBoxGlassStyle}>
            <Utensils size={20} color="#ffffff" />
          </div>
        </div>

        <div style={statCardGradientStyle}>
          <div>
            <p style={statLabelStyle}>Records</p>
            <h2 style={statValueStyle}>{totalRecords}</h2>
          </div>
          <div style={iconBoxGlassStyle}>
            <Users size={20} color="#ffffff" />
          </div>
        </div>

        <div style={statCardGradientStyle}>
          <div>
            <p style={statLabelStyle}>Avg per Record</p>
            <h2 style={statValueStyle}>{avgMealsPerRecord}</h2>
          </div>
          <div style={iconBoxGlassStyle}>
            <Filter size={20} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={filterBarStyle}>
        <div style={selectWrapperStyle}>
          <Filter size={18} color="#94a3b8" />
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={selectStyle}
          >
            <option>All Members</option>
            {members.map((m) => (
              <option key={m._id} value={m.username}>
                {m.username}
              </option>
            ))}
          </select>
        </div>

        <div style={dateWrapperStyle}>
          <Calendar size={18} color="#94a3b8" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={dateInputStyle}
          />
        </div>

        {(selectedMember !== "All Members" || selectedDate) && (
          <button
            onClick={() => {
              setSelectedMember("All Members");
              setSelectedDate("");
            }}
            style={{
              background: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              padding: "12px 15px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* MEAL HISTORY TABLE */}
      <div style={tableContainerStyle}>
        <h3 style={tableHeaderTitleStyle}>Meal Records</h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Breakfast</th>
                  <th style={thStyle}>Lunch</th>
                  <th style={thStyle}>Dinner</th>
                  <th style={{...thStyle, textAlign: "right"}}>Total</th>
                  <th style={{...thStyle, textAlign: "center"}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeals.length > 0 ? (
                  filteredMeals.map((meal) => (
                    <tr key={meal._id} style={trStyle}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={avatarStyle}>{meal.memberId.username.charAt(0)}</div>
                          <span style={{ fontWeight: "600", color: "#f8fafc" }}>
                            {meal.memberId.username}
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {new Date(meal.date).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>{meal.breakfast}</td>
                      <td style={tdStyle}>{meal.lunch}</td>
                      <td style={tdStyle}>{meal.dinner}</td>
                      <td style={{ ...tdStyle, fontWeight: "bold", textAlign: "right", color: "#f8fafc" }}>
                        {meal.total}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(meal)}
                          style={{
                            background: "#1e293b",
                            border: "1px solid #334155",
                            color: "#3b82f6",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(meal._id)}
                          style={{
                            background: "#1e293b",
                            border: "1px solid #334155",
                            color: "#ef4444",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: "80px", textAlign: "center", color: "#64748b" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <Utensils size={32} color="#1e293b" />
                        <span>No meal records found. Click "Add Meal" to create one.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginBottom: "30px",
  width: "100%",
};

const statCardGradientStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
  padding: "24px",
  borderRadius: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const statLabelStyle: React.CSSProperties = {
  color: "#ffffff",
  opacity: 0.9,
  fontSize: "13px",
  fontWeight: "600",
  margin: 0,
};

const statValueStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "800",
  margin: "5px 0 0 0",
};

const iconBoxGlassStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

const filterBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
  width: "100%",
};

const selectWrapperStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "12px 15px",
  borderRadius: "12px",
  flex: "2",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: "1px solid #1e293b",
};

const selectStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  color: "#cbd5e1",
  background: "transparent",
  cursor: "pointer",
};

const dateWrapperStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "12px 15px",
  borderRadius: "12px",
  flex: "1",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: "1px solid #1e293b",
};

const dateInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  color: "#cbd5e1",
  background: "transparent",
};

const tableContainerStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
  border: "1px solid #1e293b",
  width: "100%",
  boxSizing: "border-box",
};

const tableHeaderTitleStyle: React.CSSProperties = {
  color: "#f8fafc",
  marginBottom: "25px",
  fontSize: "18px",
  fontWeight: "700",
  margin: 0,
};

const tableHeaderRowStyle: React.CSSProperties = { background: "#1e293b" };

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px 12px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
};

const trStyle: React.CSSProperties = { borderBottom: "1px solid #1e293b" };

const tdStyle: React.CSSProperties = {
  padding: "16px 12px",
  color: "#94a3b8",
  fontSize: "14px",
};

const avatarStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  background: "#1e293b",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "bold",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "600",
  marginBottom: "8px",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalContentStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "30px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
};