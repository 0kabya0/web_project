"use client";
import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  BarChart3, 
  UtensilsCrossed, 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Scale,
  Download
} from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

type ReportTab = "Monthly Summary" | "Balance Sheet" | "Meals" | "Bazar";

interface RentBill {
  monthKey?: string;
  roomRent?: number;
  wifiBill?: number;
  buaBill?: number;
}

interface Member {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

interface MealRecord {
  _id: string;
  memberId: { _id: string; username: string; email?: string } | string | null;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
  mealType: string;
}

interface BazarRecord {
  _id: string;
  memberId: { _id: string; username: string; email?: string } | string | null;
  date: string;
  item: string;
  quantity: number;
  unit: string;
  price: number;
  total?: number;
}

interface PaymentRecord {
  _id: string;
  memberId: { _id: string; username: string; email?: string } | string | null;
  amount: number;
  paidDate: string;
  monthKey?: string;
  status: string;
}

const getLocalMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const currentMonthKey = getLocalMonthKey();

export default function ReportsPage() {
  const { stats } = useGlobalStats();
  const [activeTab, setActiveTab] = useState<ReportTab>("Monthly Summary");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [currentNow, setCurrentNow] = useState(() => new Date());
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [bazar, setBazar] = useState<BazarRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedMonthRent, setSelectedMonthRent] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setUserRole(user?.role || "user");
      } catch {
        setUserRole("user");
      }
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        const [membersRes, mealsRes, bazarRes, paymentsRes] = await Promise.all([
          fetch("/api/members"),
          fetch("/api/meals"),
          fetch("/api/bazar"),
          fetch("/api/payments"),
        ]);

        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(Array.isArray(data) ? data.filter((member: Member) => member.role !== "admin") : []);
        }
        if (mealsRes.ok) setMeals(await mealsRes.json());
        if (bazarRes.ok) setBazar(await bazarRes.json());
        if (paymentsRes.ok) setPayments(await paymentsRes.json());
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchRentForMonth = async () => {
      try {
        const response = await fetch(`/api/rent?month=${selectedMonth}`);
        if (!response.ok) {
          setSelectedMonthRent(0);
          return;
        }

        const rentData = (await response.json()) as RentBill | null;
        if (!rentData) {
          setSelectedMonthRent(0);
          return;
        }

        const totalRent = Number(rentData.roomRent || 0) + Number(rentData.wifiBill || 0) + Number(rentData.buaBill || 0);
        setSelectedMonthRent(totalRent);
      } catch (error) {
        console.error("Error loading rent for report month:", error);
        setSelectedMonthRent(0);
      }
    };

    fetchRentForMonth();
  }, [selectedMonth]);

  useEffect(() => {
    const syncNow = () => setCurrentNow(new Date());
    syncNow();
    const timer = window.setInterval(syncNow, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const isAdmin = userRole === "admin";

  const monthOptions = useMemo(() => {
    const months = new Set<string>([currentMonthKey]);
    const pushMonth = (value?: string | null) => {
      if (!value) return;
      const monthKey = value.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        months.add(monthKey);
      }
    };

    meals.forEach((meal) => pushMonth(meal.date));
    bazar.forEach((entry) => pushMonth(entry.date));
    payments.forEach((payment) => pushMonth(payment.monthKey || payment.paidDate));

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [meals, bazar, payments]);

  useEffect(() => {
    if (monthOptions.length > 0 && !monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-").map(Number);
    if (!year || !month) return monthKey;
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
      new Date(year, month - 1, 1)
    );
  };

  const formatCurrency = (value: number) => `৳${value.toFixed(2)}`;
  const formatAmount = (value: number) => `৳${value.toFixed(0)}`;
  const getMonthKey = (value?: string | null) => (value ? value.slice(0, 7) : "");
  const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

  const getRecordMember = (member: MealRecord["memberId"] | BazarRecord["memberId"] | PaymentRecord["memberId"]) => {
    if (!member || typeof member === "string") {
      return { id: "", username: "Unknown Member", email: "" };
    }

    return {
      id: member._id || "",
      username: member.username || "Unknown Member",
      email: member.email || "",
    };
  };

  const selectedMonthLabel = formatMonthLabel(selectedMonth);
  const monthMeals = useMemo(() => meals.filter((meal) => getMonthKey(meal.date) === selectedMonth), [meals, selectedMonth]);
  const monthBazars = useMemo(() => bazar.filter((entry) => getMonthKey(entry.date) === selectedMonth), [bazar, selectedMonth]);
  const monthPayments = useMemo(
    () => payments.filter((payment) => payment.status === "completed" && (payment.monthKey === selectedMonth || getMonthKey(payment.paidDate) === selectedMonth)),
    [payments, selectedMonth]
  );

  const monthMealTotal = monthMeals.reduce((sum, meal) => sum + (meal.total || 0), 0);
  const monthBazarTotal = monthBazars.reduce((sum, entry) => sum + ((entry.total ?? entry.quantity * entry.price) || 0), 0);
  const monthPaymentTotal = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const monthMealRate = monthMealTotal > 0 ? monthBazarTotal / monthMealTotal : 0;

  const monthMealsByMember = useMemo(() => {
    return monthMeals.reduce((acc, meal) => {
      const memberId = getRecordMember(meal.memberId).id;
      if (!memberId) return acc;
      acc[memberId] = (acc[memberId] || 0) + (meal.total || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [monthMeals]);

  const monthBazarsByMember = useMemo(() => {
    return monthBazars.reduce((acc, entry) => {
      const memberId = getRecordMember(entry.memberId).id;
      if (!memberId) return acc;
      const amount = (entry.total ?? entry.quantity * entry.price) || 0;
      acc[memberId] = (acc[memberId] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  }, [monthBazars]);

  const monthPaidMemberIds = useMemo(() => {
    return new Set(
      monthPayments
        .map((payment) => getRecordMember(payment.memberId).id)
        .filter(Boolean)
    );
  }, [monthPayments]);

  const monthMemberBalances = useMemo(() => {
    return members.reduce((acc, member) => {
      const mealCost = (monthMealsByMember[member._id] || 0) * monthMealRate;
      const giveTake = mealCost - (monthBazarsByMember[member._id] || 0);
      acc[member._id] = selectedMonthRent + giveTake;
      return acc;
    }, {} as Record<string, number>);
  }, [members, monthMealsByMember, monthBazarsByMember, monthMealRate, selectedMonthRent]);

  const totalPaidBalance = useMemo(() => {
    return members
      .filter((member) => monthPaidMemberIds.has(member._id))
      .reduce((sum, member) => sum + (monthMemberBalances[member._id] || 0), 0);
  }, [members, monthPaidMemberIds, monthMemberBalances]);

  const totalSummaryBalance = useMemo(() => {
    return members.reduce((sum, member) => sum + (monthMemberBalances[member._id] || 0), 0);
  }, [members, monthMemberBalances]);

  const monthBazarByMember = useMemo(() => {
    return monthBazars.reduce((acc, entry) => {
      const memberId = getRecordMember(entry.memberId).id;
      if (!memberId) return acc;
      const amount = (entry.total ?? entry.quantity * entry.price) || 0;
      acc[memberId] = (acc[memberId] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  }, [monthBazars]);

  const balanceSheetRows = useMemo(() => {
    return members.map((member) => {
      const memberMeals = monthMeals
        .filter((meal) => getRecordMember(meal.memberId).id === member._id)
        .reduce((sum, meal) => sum + (meal.total || 0), 0);

      const mealCost = memberMeals * monthMealRate;
      const memberBazar = monthBazarByMember[member._id] || 0;
      const giveTake = mealCost - memberBazar;
      const paidAmount = monthPayments
        .filter((payment) => getRecordMember(payment.memberId).id === member._id)
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const balance = selectedMonthRent + giveTake;
      const isPaid = balance <= 0 || paidAmount >= balance;

      return {
        member,
        meals: memberMeals,
        mealCost,
        paidAmount,
        balance,
        isPaid,
      };
    });
  }, [members, monthMeals, monthPayments, monthMealRate, monthBazarByMember, selectedMonthRent]);

  const monthBalance = totalSummaryBalance;

  const exportCurrentReport = () => {
    if (!isAdmin) return;

    const doc = new jsPDF({ orientation: activeTab === "Monthly Summary" ? "portrait" : "landscape" });
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Reports & Analytics", 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Month: ${selectedMonthLabel}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    if (activeTab === "Monthly Summary") {
      autoTable(doc, {
        startY: 40,
        head: [["Metric", "Value"]],
        body: [
          ["Total Meals", monthMealTotal.toFixed(1)],
          ["Total Bazar", formatAmount(monthBazarTotal)],
          ["Total Payments", formatCurrency(totalPaidBalance)],
          ["Meal Rate", formatCurrency(monthMealRate)],
          ["Total Balance", formatCurrency(monthBalance)],
          ["Total Members", String(stats.totalMembers)],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });
    }

    if (activeTab === "Balance Sheet") {
      autoTable(doc, {
        startY: 40,
        head: [["Member", "Meals", "Meal Cost", "Paid", "Balance"]],
        body: balanceSheetRows.map((row) => [
          row.member.username,
          row.meals.toFixed(1),
          formatCurrency(row.mealCost),
          row.isPaid ? "✔" : "✘",
          formatCurrency(row.balance),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });
    }

    if (activeTab === "Meals") {
      autoTable(doc, {
        startY: 40,
        head: [["Member", "Date", "Type", "Breakfast", "Lunch", "Dinner", "Total"]],
        body: monthMeals.map((meal) => {
          const member = getRecordMember(meal.memberId);
          return [
            member.username,
            formatDate(meal.date),
            meal.mealType === "guest" ? "Guest" : "Own",
            String(meal.breakfast || 0),
            String(meal.lunch || 0),
            String(meal.dinner || 0),
            String(meal.total || 0),
          ];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });
    }

    if (activeTab === "Bazar") {
      autoTable(doc, {
        startY: 40,
        head: [["Purchased By", "Date", "Item", "Qty", "Unit", "Amount"]],
        body: monthBazars.map((entry) => {
          const member = getRecordMember(entry.memberId);
          return [
            member.username,
            formatDate(entry.date),
            entry.item,
            String(entry.quantity || 0),
            entry.unit,
            formatCurrency(entry.total ?? entry.quantity * entry.price),
          ];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });
    }

    const fileName = `${activeTab.toLowerCase().replace(/\s+/g, "-")}-${selectedMonth}.pdf`;
    doc.save(fileName);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Monthly Summary":
        return (
          <div style={innerSummaryCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "12px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", color: "#94a3b8", fontWeight: "600" }}>Current Period</h4>
              </div>
              <div style={statusBadgeStyle}>{formatCurrency(monthBalance)}</div>
            </div>
            <div style={innerGridStyle}>
              <SummaryItem label="Total Meals" value={monthMealTotal.toFixed(1)} icon={<UtensilsCrossed size={16} color="#22c55e" />} bgColor="rgba(34, 197, 94, 0.1)" />
              <SummaryItem label="Total Bazar" value={formatAmount(monthBazarTotal)} icon={<ShoppingCart size={16} color="#eab308" />} bgColor="rgba(234, 179, 8, 0.1)" />
              <SummaryItem label="Total Payments" value={formatCurrency(totalPaidBalance)} icon={<Wallet size={16} color="#6366f1" />} bgColor="rgba(99, 102, 241, 0.1)" />
              <SummaryItem label="Meal Rate" value={formatCurrency(monthMealRate)} icon={<TrendingUp size={16} color="#a855f7" />} bgColor="rgba(168, 85, 247, 0.1)" />
              <SummaryItem label="Total Members" value={stats.totalMembers.toString()} icon={<BarChart3 size={16} color="#38bdf8" />} bgColor="rgba(56, 189, 248, 0.1)" />
              <SummaryItem label="Total Balance" value={formatCurrency(monthBalance)} icon={<Scale size={16} color="#f97316" />} bgColor="rgba(249, 115, 22, 0.1)" />
            </div>
          </div>
        );

      case "Balance Sheet":
        return (
          <div style={tableWrapperStyle}>
            <div style={tableHeaderActionStyle}>
              <div>
                <h3 style={tableTitleStyle}>Member Balance Sheet</h3>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{selectedMonthLabel}</p>
              </div>
              <button style={exportButtonStyle} onClick={exportCurrentReport}>
                <Download size={14} /> Export PDF
              </button>
            </div>
            <div style={{ overflowX: "auto", borderRadius: "12px" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableRowHeaderStyle}>
                    <th style={thStyle}>Member</th>
                    <th style={thStyle}>Meals</th>
                    <th style={thStyle}>Meal Cost</th>
                    <th style={thStyle}>Paid</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceSheetRows.length > 0 ? (
                    balanceSheetRows.map((row) => (
                      <tr key={row.member._id}>
                        <td style={reportTdStyle}>{row.member.username}</td>
                        <td style={reportTdStyle}>{row.meals.toFixed(1)}</td>
                        <td style={reportTdStyle}>{formatCurrency(row.mealCost)}</td>
                        <td style={{ ...reportTdStyle, fontWeight: "800", color: row.isPaid ? "#22c55e" : "#ef4444" }}>{row.isPaid ? "✔" : "✘"}</td>
                        <td style={{ ...reportTdStyle, textAlign: "right", fontWeight: "700" }}>{formatCurrency(row.balance)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={emptyTdStyle}>No records found for this term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Meals":
        return (
          <div style={tableWrapperStyle}>
            <div style={tableHeaderActionStyle}>
              <div>
                <h3 style={tableTitleStyle}>Daily Meal Records</h3>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{selectedMonthLabel}</p>
              </div>
              <button style={exportButtonStyle} onClick={exportCurrentReport}>
                <Download size={14} /> Export PDF
              </button>
            </div>
            <div style={{ overflowX: "auto", borderRadius: "12px" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableRowHeaderStyle}>
                    <th style={thStyle}>Member</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Breakfast</th>
                    <th style={thStyle}>Lunch</th>
                    <th style={thStyle}>Dinner</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthMeals.length > 0 ? (
                    monthMeals.map((meal) => {
                      const member = getRecordMember(meal.memberId);
                      return (
                        <tr key={meal._id}>
                          <td style={reportTdStyle}>{member.username}</td>
                          <td style={reportTdStyle}>{formatDate(meal.date)}</td>
                          <td style={reportTdStyle}>{meal.mealType === "guest" ? "Guest" : "Own"}</td>
                          <td style={reportTdStyle}>{meal.breakfast}</td>
                          <td style={reportTdStyle}>{meal.lunch}</td>
                          <td style={reportTdStyle}>{meal.dinner}</td>
                          <td style={{ ...reportTdStyle, textAlign: "right", fontWeight: "700" }}>{meal.total}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={emptyTdStyle}>No records found for this term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Bazar":
        return (
          <div style={tableWrapperStyle}>
            <div style={tableHeaderActionStyle}>
              <div>
                <h3 style={tableTitleStyle}>Bazar Expenditure</h3>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{selectedMonthLabel}</p>
              </div>
              <button style={exportButtonStyle} onClick={exportCurrentReport}>
                <Download size={14} /> Export PDF
              </button>
            </div>
            <div style={{ overflowX: "auto", borderRadius: "12px" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableRowHeaderStyle}>
                    <th style={thStyle}>Purchased By</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Item</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Unit</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {monthBazars.length > 0 ? (
                    monthBazars.map((entry) => {
                      const member = getRecordMember(entry.memberId);
                      const amount = entry.total ?? entry.quantity * entry.price;
                      return (
                        <tr key={entry._id}>
                          <td style={reportTdStyle}>{member.username}</td>
                          <td style={reportTdStyle}>{formatDate(entry.date)}</td>
                          <td style={reportTdStyle}>{entry.item}</td>
                          <td style={reportTdStyle}>{entry.quantity}</td>
                          <td style={reportTdStyle}>{entry.unit}</td>
                          <td style={{ ...reportTdStyle, textAlign: "right", fontWeight: "700" }}>{formatAmount(amount)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={emptyTdStyle}>No records found for this term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!loading && !isAdmin) {
    return (
      <div style={{ animation: "fadeIn 0.5s", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px", color: "#f8fafc" }}>
        <header style={{ marginBottom: "25px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>Reports & Analytics</h1>
          <p style={{ color: "#94a3b8", marginTop: "5px" }}>Admin access required.</p>
        </header>
        <div style={mainReportCardStyle}>
          <p style={{ margin: 0, color: "#cbd5e1" }}>Only admin users can view and export reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.5s", paddingBottom: "40px", width: "100%", boxSizing: "border-box", paddingRight: "10px" }}>
      {/* PAGE HEADER */}
      <header style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#ffffff" }}>Reports & Analytics</h1>
        <p style={{ color: "#94a3b8", marginTop: "5px" }}>Comprehensive mess financial data</p>
      </header>

      {/* FILTER BOX */}
      <div style={selectorContainerStyle}>
        <Calendar size={18} color="#94a3b8" />
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={selectInputStyle}>
          {monthOptions.map((monthKey) => (
            <option key={monthKey} value={monthKey}>
              {formatMonthLabel(monthKey)}
            </option>
          ))}
        </select>
      </div>

      {/* TOP STATS CARDS */}
      <div style={statsGridStyle}>
        <StatCard label="Total Meals" value={monthMealTotal.toFixed(1)} icon={<UtensilsCrossed size={20} color="#ffffff" />} />
        <StatCard label="Total Bazar" value={formatAmount(monthBazarTotal)} icon={<ShoppingCart size={20} color="#ffffff" />} />
        <StatCard label="Total Payments" value={formatCurrency(totalPaidBalance)} icon={<Wallet size={20} color="#ffffff" />} />
        <StatCard label="Meal Rate" value={formatCurrency(monthMealRate)} icon={<TrendingUp size={20} color="#ffffff" />} />
        <StatCard label="Total Members" value={stats.totalMembers.toString()} icon={<BarChart3 size={20} color="#ffffff" />} />
      </div>

      {/* NAVIGATION TABS */}
      <div style={tabContainerStyle}>
        <TabButton title="Monthly Summary" icon={<BarChart3 size={16} />} active={activeTab} setter={setActiveTab} />
        <TabButton title="Balance Sheet" icon={<Scale size={16} />} active={activeTab} setter={setActiveTab} />
        <TabButton title="Meals" icon={<UtensilsCrossed size={16} />} active={activeTab} setter={setActiveTab} />
        <TabButton title="Bazar" icon={<ShoppingCart size={16} />} active={activeTab} setter={setActiveTab} />
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div style={mainReportCardStyle}>
        {loading ? (
          <div style={{ padding: "70px 0", textAlign: "center", color: "#64748b" }}>Loading report data...</div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={statCardStyle}>
      <div style={{ flex: 1 }}>
        <p style={statLabelStyle}>{label}</p>
        <h3 style={statValueStyle}>{value}</h3>
      </div>
      <div style={iconBoxStyle}>{icon}</div>
    </div>
  );
}

function TabButton({ title, icon, active, setter }: any) {
  const isActive = active === title;
  return (
    <button 
      onClick={() => setter(title)}
      style={{
        ...tabButtonStyle,
        backgroundColor: isActive ? "#1e293b" : "transparent",
        color: isActive ? "#f8fafc" : "#94a3b8",
      }}
    >
      {icon} {title}
    </button>
  );
}

function SummaryItem({ label, value, icon, bgColor }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ ...smallIconStyle, backgroundColor: bgColor }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>{value}</p>
      </div>
    </div>
  );
}

// --- STYLES ---

const selectorContainerStyle: React.CSSProperties = {
  background: "#0f172a", padding: "12px 20px", borderRadius: "12px",
  display: "flex", alignItems: "center", gap: "10px", marginBottom: "25px",
  width: "100%", maxWidth: "400px", border: "1px solid #1e293b"
};

const selectInputStyle: React.CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontSize: "14px", color: "#cbd5e1", width: "100%", cursor: "pointer"
};

const statsGridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px", marginBottom: "30px"
};

// VIOLET GRADIENT APPLIED HERE
const statCardStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", 
  padding: "20px", borderRadius: "16px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

// TRANSPARENT GLASS EFFECT FOR ICON BOX
const iconBoxStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.2)", padding: "10px", borderRadius: "12px",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "1px solid rgba(255, 255, 255, 0.3)"
};

const statLabelStyle = { margin: 0, color: "#ffffff", opacity: 0.9, fontSize: "13px", fontWeight: "600" };
const statValueStyle = { margin: "5px 0 0 0", color: "#ffffff", fontSize: "22px", fontWeight: "800" };

const tabContainerStyle: React.CSSProperties = {
  display: "flex", gap: "5px", marginBottom: "25px", background: "#0f172a",
  padding: "5px", borderRadius: "12px", width: "fit-content", border: "1px solid #1e293b"
};

const tabButtonStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
  borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600",
  cursor: "pointer", transition: "all 0.2s"
};

const mainReportCardStyle: React.CSSProperties = {
  background: "#0f172a", padding: "30px", borderRadius: "24px",
  border: "1px solid #1e293b", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", minHeight: "350px"
};

const innerSummaryCardStyle: React.CSSProperties = {
  border: "1px solid #1e293b", borderRadius: "20px", padding: "25px", maxWidth: "500px"
};

const statusBadgeStyle = {
  background: "#1e293b", color: "#cbd5e1", padding: "4px 12px",
  borderRadius: "999px", fontSize: "13px", fontWeight: "700"
};

const innerGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };

const smallIconStyle: React.CSSProperties = {
  width: "36px", height: "36px", borderRadius: "10px",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const tableWrapperStyle: React.CSSProperties = { width: "100%" };
const tableHeaderActionStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"
};

const tableTitleStyle = { margin: 0, color: "#f8fafc", fontSize: "18px", fontWeight: "700" };

const exportButtonStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px",
  background: "#1e293b", border: "1px solid #334155", borderRadius: "8px",
  fontSize: "12px", fontWeight: "600", color: "#cbd5e1", cursor: "pointer"
};

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: "600px" };
const tableRowHeaderStyle = { background: "#1e293b" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "16px 12px", color: "#94a3b8", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const };
const reportTdStyle: React.CSSProperties = { padding: "16px 12px", color: "#cbd5e1", fontSize: "14px", borderBottom: "1px solid #1e293b" };
const emptyTdStyle: React.CSSProperties = { padding: "80px 0", textAlign: "center", color: "#64748b", fontSize: "14px", borderBottom: "none" };