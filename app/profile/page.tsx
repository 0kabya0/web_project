"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Mail, Calendar, Edit2, Save, X, UtensilsCrossed, ShoppingBag, TrendingUp, Home, Wallet, Soup } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

interface Member {
  _id: string;
  username: string;
  email?: string;
  role?: string;
  phone?: string | null;
  roomNumber?: string | null;
  address?: string | null;
  isActive?: boolean;
  createdAt?: string;
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

// --- STYLES - Define before component ---

const editButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid #4f46e5",
  background: "linear-gradient(120deg, #4f46e5 0%, #7c3aed 100%)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
};

const editFormStyle: React.CSSProperties = {
  background: "rgba(79, 70, 229, 0.05)",
  padding: "18px",
  borderRadius: "12px",
  border: "1px solid rgba(79, 70, 229, 0.2)",
  marginBottom: "18px"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: "600"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "rgba(15, 23, 42, 0.5)",
  color: "#f8fafc",
  fontSize: "14px",
  boxSizing: "border-box",
  fontFamily: "inherit"
};

const saveButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flex: 1,
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(120deg, #4f46e5 0%, #7c3aed 100%)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
};

const cancelButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flex: 1,
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "transparent",
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
};

export default function ProfilePage() {
  const { stats } = useGlobalStats();
  const [userData, setUserData] = useState({ username: "Guest", email: "user@example.com", role: "Member", status: "Active" });
  const [memberId, setMemberId] = useState("");
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [bazars, setBazars] = useState<BazarRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [rentBill, setRentBill] = useState<RentBill>({ roomRent: 0, wifiBill: 0, buaBill: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", roomNumber: "", address: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      const isAdminUser = parsed.role === "admin";
      setIsAdmin(isAdminUser);
      setUserData({
        username: isAdminUser ? `${parsed.username} - Manager` : (parsed.username || "User"),
        email: parsed.email || `${parsed.username?.toLowerCase().replace(/\s/g, "")}@gmail.com`,
        role: isAdminUser ? "Admin - Manager" : "Member",
        status: parsed.status || (isAdminUser ? "Approved" : "Active")
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
            const nonAdminMembers = membersData.filter((m) => m.role !== "admin");
            setAllMembers(nonAdminMembers);
            const currentMember = membersData.find((m) => (m.username || "").toLowerCase() === (parsed.username || "").toLowerCase());
            setMemberId(currentMember?._id || "");
            
            // Set edit form with member data
            if (currentMember && !isAdminUser) {
              setEditForm({
                phone: (currentMember as any).phone || "",
                roomNumber: (currentMember as any).roomNumber || "",
                address: (currentMember as any).address || ""
              });
            }
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

  const selectedMember = useMemo(
    () => allMembers.find((m) => m._id === selectedMemberId) || null,
    [allMembers, selectedMemberId]
  );

  const adminViewMemberMeals = useMemo(() => {
    if (!selectedMemberId) return 0;
    return monthMeals
      .filter((meal) => getIdFromRef(meal.memberId) === selectedMemberId)
      .reduce((sum, meal) => sum + Number(meal.total || 0), 0);
  }, [monthMeals, selectedMemberId]);

  const adminViewMemberBazar = useMemo(() => {
    if (!selectedMemberId) return 0;
    return monthBazars
      .filter((entry) => getIdFromRef(entry.memberId) === selectedMemberId)
      .reduce((sum, entry) => sum + getBazarAmount(entry), 0);
  }, [monthBazars, selectedMemberId]);

  const adminViewMemberMealCost = adminViewMemberMeals * monthMealRate;
  const adminViewMemberBalance = totalRent + (adminViewMemberMealCost - adminViewMemberBazar);

  const handleEditMember = async () => {
    if (!memberId) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        alert('Profile updated successfully');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.5s", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
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
      </div>

      <div style={memberInfoCardStyle}>
        <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" }}>Sign In / Sign Up Information</h3>
            <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Your member account details from the current session</p>
          </div>
          {!isAdmin && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="move-card"
              style={editButtonStyle}
            >
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>

        {isEditing && !isAdmin && (
          <div style={editFormStyle}>
            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                style={inputStyle}
                placeholder="Enter phone number"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Room Number</label>
              <input
                type="text"
                value={editForm.roomNumber}
                onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                style={inputStyle}
                placeholder="Enter room number"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Address</label>
              <textarea
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                placeholder="Enter address"
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={handleEditMember}
                disabled={isSaving}
                className="move-card"
                style={saveButtonStyle}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="move-card"
                style={cancelButtonStyle}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <div style={memberInfoGridStyle}>
            <InfoRow label="Member Name" value={userData.username} />
            <InfoRow label="Email" value={userData.email} />
            {!isAdmin && <InfoRow label="Phone" value={editForm.phone || "Not provided"} />}
            {!isAdmin && <InfoRow label="Room Number" value={editForm.roomNumber || "Not provided"} />}
            {!isAdmin && <InfoRow label="Address" value={editForm.address || "Not provided"} />}
            {isAdmin && <InfoRow label="Role" value={userData.role} />}
            <InfoRow label="Status" value={userData.status} />
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={memberInfoCardStyle}>
          <div style={{ marginBottom: "18px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" }}>Member Profile Viewer</h3>
              <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>All members are listed below. Click a member to view profile and monthly summary.</p>
            </div>
          </div>

          {allMembers.length > 0 ? (
            <div style={adminViewerLayoutStyle}>
              <div style={memberListPanelStyle}>
                {allMembers.map((member) => {
                  const isSelected = member._id === selectedMemberId;
                  return (
                    <button
                      key={member._id}
                      type="button"
                      className="move-card"
                      onClick={() => setSelectedMemberId((prev) => (prev === member._id ? "" : member._id))}
                      style={isSelected ? selectedMemberListButtonStyle : memberListButtonStyle}
                    >
                      <span style={{ color: "#f8fafc", fontWeight: 700 }}>{member.username}</span>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>{member.email || "No email"}</span>
                    </button>
                  );
                })}
              </div>

              <div style={memberDetailPanelStyle}>
                {selectedMember ? (
                  <>
                    <div style={memberInfoGridStyle}>
                      <InfoRow label="Member Name" value={selectedMember.username} />
                      <InfoRow label="Email" value={selectedMember.email || "Not provided"} />
                      <InfoRow label="Phone" value={selectedMember.phone || "Not provided"} />
                      <InfoRow label="Room Number" value={selectedMember.roomNumber || "Not provided"} />
                      <InfoRow label="Address" value={selectedMember.address || "Not provided"} />
                      <InfoRow label="Status" value={selectedMember.isActive ? "Active" : "Inactive"} />
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <h4 style={{ margin: "0 0 12px 0", color: "#f8fafc", fontSize: "16px" }}>Monthly Summary ({monthLabel})</h4>
                      <div style={memberInfoGridStyle}>
                        <StatCard label="Personal Meals" value={adminViewMemberMeals.toFixed(1)} suffix="units" icon={Soup} />
                        <StatCard label="Meal Cost" value={`৳${adminViewMemberMealCost.toFixed(2)}`} icon={UtensilsCrossed} />
                        <StatCard label="Bazar Expenses" value={`৳${adminViewMemberBazar.toFixed(2)}`} icon={ShoppingBag} />
                        <StatCard label="Meal Rate" value={`৳${monthMealRate.toFixed(2)}`} suffix="/unit" icon={TrendingUp} />
                        <StatCard label="Total Rent" value={`৳${totalRent.toFixed(2)}`} icon={Home} />
                        <StatCard
                          label="Balance"
                          value={`${adminViewMemberBalance >= 0 ? '+' : ''}৳${Math.abs(adminViewMemberBalance).toFixed(2)}`}
                          isHighlight={true}
                          isBalance={adminViewMemberBalance >= 0}
                          icon={Wallet}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ color: "#94a3b8", margin: 0 }}>Select a member name from the list to view profile. Click the same member again to hide it.</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: "#94a3b8", margin: 0 }}>No members found to display.</p>
          )}
        </div>
      )}

      {/* FINANCIAL SUMMARY FOR MEMBERS */}
      {!isAdmin && (
        <div style={memberInfoCardStyle}>
          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" }}>Monthly Financial Summary</h3>
            <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Your financial breakdown for {monthLabel}</p>
          </div>

          <div style={memberInfoGridStyle}>
            <StatCard label="Personal Meals" value={memberMeals.toFixed(1)} suffix="units" icon={Soup} />
            <StatCard label="Meal Cost" value={`৳${memberMealCost.toFixed(2)}`} icon={UtensilsCrossed} />
            <StatCard label="Bazar Expenses" value={`৳${memberBazar.toFixed(2)}`} icon={ShoppingBag} />
            <StatCard label="Meal Rate" value={`৳${monthMealRate.toFixed(2)}`} suffix="/unit" icon={TrendingUp} />
            <StatCard label="Total Rent" value={`৳${totalRent.toFixed(2)}`} icon={Home} />
            <StatCard 
              label="Your Balance" 
              value={`${memberBalance >= 0 ? '+' : ''}৳${Math.abs(memberBalance).toFixed(2)}`}
              isHighlight={true}
              isBalance={memberBalance >= 0}
              icon={Wallet}
            />
          </div>

          <div style={{ marginTop: "20px", padding: "14px", background: "rgba(79, 70, 229, 0.1)", borderRadius: "12px", border: "1px solid rgba(79, 70, 229, 0.3)" }}>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
              <strong style={{ color: "#f8fafc" }}>Balance Calculation:</strong> Total Rent + (Meal Cost - Bazar Expenses)
              <br />
              {memberBalance > 0 ? (
                <span style={{ color: "#fca5a5" }}>You need to pay: ৳{memberBalance.toFixed(2)}</span>
              ) : (
                <span style={{ color: "#34d399" }}>You have a credit of: ৳{Math.abs(memberBalance).toFixed(2)}</span>
              )}
            </p>
          </div>
        </div>
      )}


    </div>
  );
}

// --- STYLES ---

const profileCardStyle: React.CSSProperties = {
  background: "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 28%, rgba(0,0,0,0) 55%), linear-gradient(120deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)",
  padding: "32px",
  borderRadius: "26px",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  marginBottom: "26px",
  flexWrap: "wrap",
  gap: "22px",
  boxShadow: "0 20px 40px -15px rgba(79, 70, 229, 0.65)",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.2)"
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

const adminViewerLayoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(240px, 300px) 1fr",
  gap: "16px",
  alignItems: "start"
};

const memberListPanelStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
  border: "1px solid #23314a",
  borderRadius: "16px",
  padding: "12px",
  display: "grid",
  gap: "8px",
  maxHeight: "520px",
  overflowY: "auto"
};

const memberDetailPanelStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
  border: "1px solid #23314a",
  borderRadius: "16px",
  padding: "14px"
};

const memberListButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  border: "1px solid #1f2937",
  borderRadius: "12px",
  background: "rgba(15, 23, 42, 0.65)",
  padding: "10px 12px",
  cursor: "pointer",
  display: "grid",
  gap: "4px"
};

const selectedMemberListButtonStyle: React.CSSProperties = {
  ...memberListButtonStyle,
  border: "1px solid rgba(79, 70, 229, 0.8)",
  background: "linear-gradient(120deg, rgba(79, 70, 229, 0.32) 0%, rgba(124, 58, 237, 0.26) 100%)",
  boxShadow: "0 0 0 1px rgba(79, 70, 229, 0.3)"
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="move-card" style={{ background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)", border: "1px solid #23314a", borderRadius: "16px", padding: "14px 16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
      <div style={{ color: "#93a4bf", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>{label}</div>
      <div style={{ color: "#f8fafc", fontSize: "15px", fontWeight: "700", lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function StatCard({ label, value, suffix = "", isHighlight = false, isBalance = true, icon: Icon }: { label: string; value: string; suffix?: string; isHighlight?: boolean; isBalance?: boolean; icon?: React.ComponentType<{ size: number; color: string }> }) {
  return (
    <div className="move-card" style={{ 
      background: isHighlight ? "linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))" : "linear-gradient(180deg, #111827 0%, #0f172a 100%)", 
      border: isHighlight ? "1px solid rgba(79, 70, 229, 0.4)" : "1px solid #23314a", 
      borderRadius: "16px", 
      padding: "14px 16px", 
      boxShadow: isHighlight ? "0 0 12px rgba(79, 70, 229, 0.2)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
      textAlign: "center" 
    }}>
      {Icon && (
        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
          <Icon size={24} color={isHighlight ? (isBalance ? "#34d399" : "#fca5a5") : "#4f46e5"} />
        </div>
      )}
      <div style={{ color: "#93a4bf", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>{label}</div>
      <div style={{ color: isHighlight ? (isBalance ? "#34d399" : "#fca5a5") : "#f8fafc", fontSize: "18px", fontWeight: "700", lineHeight: 1.3 }}>
        {value} <span style={{ fontSize: "12px", color: "#94a3b8" }}>{suffix}</span>
      </div>
    </div>
  );
}