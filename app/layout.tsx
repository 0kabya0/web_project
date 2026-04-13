"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ClipboardList, Utensils, ShoppingCart, 
  Wallet, User, FileText 
} from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Robust check: hides sidebar if the path is exactly "/" or "/login"
  // The .replace(/\/$/, "") handles cases where there is a trailing slash
  const isLoginPage = pathname === "/" || pathname === "" || pathname?.includes('/login');

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <ClipboardList size={20} />, label: "Summary", href: "/summary" },
    { icon: <Utensils size={20} />, label: "Meals", href: "/meals" },
    { icon: <ShoppingCart size={20} />, label: "Bazar", href: "/bazar" },
    { icon: <Wallet size={20} />, label: "Payments", href: "/payments" },
    { icon: <User size={20} />, label: "My Profile", href: "/profile" },
    { icon: <FileText size={20} />, label: "Reports", href: "/reports" },
  ];

  return (
    <html lang="en">
      <body style={styles.container}>
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

        {/* This block ONLY renders if it's NOT the login page */}
        {!isLoginPage && (
          <aside style={styles.sidebar}>
            <div style={styles.logoSection}>
              <div style={styles.logoIcon}>🏠</div>
              <h2 style={styles.logoText}>MESS MASTER</h2>
            </div>
            <nav style={styles.nav}>
              {sidebarItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={index} style={{ textDecoration: 'none' }}>
                    <div style={isActive ? styles.navItemActive : styles.navItem} className="move-card">
                      {item.icon} <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main content expands to full width if it's the login page */}
        <main style={{ 
          ...styles.mainContent, 
          ...(isLoginPage ? styles.authMainContent : {}) 
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { 
    display: "flex", 
    height: "100vh", 
    background: "#020617", 
    color: "#f8fafc", 
    fontFamily: "'Inter', sans-serif", 
    margin: 0,
    width: "100vw",
    overflow: "hidden" 
  },
  sidebar: { 
    width: "260px", 
    minWidth: "260px",
    background: "rgba(255, 255, 255, 0.03)", 
    borderRight: "1px solid rgba(255,255,255,0.1)", 
    display: "flex", 
    flexDirection: "column", 
    padding: "20px" 
  },
  logoSection: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", padding: "10px" },
  logoIcon: { background: "#3b82f6", width: "32px", height: "32px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center" },
  logoText: { fontSize: "18px", fontWeight: "bold", margin: 0 },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", color: "#94a3b8", transition: "0.3s" },
  navItemActive: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontWeight: "600" },
  mainContent: { 
    flex: 1, 
    padding: "40px", 
    overflowY: "auto",
    position: "relative"
  },
  authMainContent: { 
    padding: "0px", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
};