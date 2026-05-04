"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, ClipboardList, Utensils, ShoppingCart, 
  Wallet, User, FileText, LogOut, ChevronDown,
  Users, Settings, X
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{ username: string; role?: string }>({ username: "Guest" });

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserData({
        username: parsed.role === "admin" ? `${parsed.username} - Manager` : (parsed.username || "Guest"),
        role: parsed.role
      });
    }
  }, [pathname]);

  // Detect mobile / small screens and close sidebar by default on mobile
  useEffect(() => {
    function onResize() {
      const mobile = typeof window !== 'undefined' && window.innerWidth <= 1023;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // ensure desktop shows sidebar via styles
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isLoginPage = pathname === "/" || pathname === "" || pathname?.includes('/login');

  const handleLogout = () => {
    localStorage.removeItem("mess_user"); // Clear session
    router.push("/"); // Redirect to login
  };

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard", roles: ['admin', 'user'] },
    { icon: <ClipboardList size={20} />, label: "Summary", href: "/summary", roles: ['admin', 'user'] },
    { icon: <Utensils size={20} />, label: "Meals", href: "/meals", roles: ['admin', 'user'] },
    { icon: <ShoppingCart size={20} />, label: "Bazar", href: "/bazar", roles: ['admin', 'user'] },
    { icon: <Wallet size={20} />, label: "Payments", href: "/payments", roles: ['admin', 'user'] },
    { icon: <Users size={20} />, label: "Members", href: "/members", roles: ['admin'] },
    { icon: <Settings size={20} />, label: "Manage Mess", href: "/managemess", roles: ['admin'] },
    { icon: <User size={20} />, label: "My Profile", href: "/profile", roles: ['admin', 'user'] },
    { icon: <FileText size={20} />, label: "Reports", href: "/reports", roles: ['admin'] },
  ];

  const filteredSidebarItems = sidebarItems.filter(item => item.roles.includes(userData.role || 'user'));

  return (
    <div style={styles.container} className="app-root">
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
        .logout-item:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }
        /* Custom Scrollbar for Sidebar */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>

      {!isLoginPage && (
        <aside style={{ ...styles.sidebar, ...(isMobile ? styles.sidebarMobile : {}), display: isMobile ? (sidebarOpen ? 'flex' : 'none') : 'flex' }} className="sidebar">
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>🏠</div>
            <h2 style={styles.logoText}>MESS MASTER</h2>
          </div>
          <nav style={styles.nav} className="sidebar-nav">
            {filteredSidebarItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link href={item.href} key={index} style={{ textDecoration: 'none' }} onClick={() => { if (isMobile) setSidebarOpen(false); }}>
                  <div style={isActive ? styles.navItemActive : styles.navItem} className="move-card">
                    {item.icon} <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Hamburger Toggle for mobile */}
      {!isLoginPage && isMobile && (
        <>
          <button
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ ...styles.hamburgerBtn, display: sidebarOpen ? 'none' : 'flex' }}
            className="hamburger-btn"
          >
            <div style={styles.hamburgerLines} />
          </button>

          {/* Backdrop to close sidebar when open on mobile */}
          {sidebarOpen && <div style={styles.backdrop} onClick={() => setSidebarOpen(false)} />}
        </>
      )}

      <main style={{ 
        ...styles.mainContent, 
        ...(isLoginPage ? styles.authMainContent : {}) 
      }} className={isLoginPage ? "container auth-container" : "container"}>
        {/* TOP RIGHT USER BOX */}
        {!isLoginPage && (
          <div style={styles.topRightActions} className="topRightActions">
            <div 
              style={styles.userDropdownTrigger} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div style={styles.avatar}>
                {userData.username.charAt(0).toUpperCase()}
              </div>
                <span style={styles.username} className="username">{userData.username}</span>
              <ChevronDown size={16} color="#94a3b8" />

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div style={styles.dropdownMenu}>
                  <div 
                    className="logout-item" 
                    style={styles.dropdownItem} 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
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
    width: "100%",
    overflow: "hidden" 
  },
  sidebar: { 
    width: "260px",
    minWidth: "260px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    flexDirection: "column",
    padding: "20px",
    boxSizing: "border-box"
  },
  logoSection: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", padding: "10px" },
  logoIcon: { background: "#3b82f6", width: "32px", height: "32px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center" },
  logoText: { fontSize: "18px", fontWeight: "bold", margin: 0 },
  nav: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: "8px",
    overflowY: "auto",
    paddingRight: "5px"
  },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", color: "#94a3b8", transition: "0.3s" },
  navItemActive: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontWeight: "600" },
  
  mainContent: { 
    flex: 1, 
    padding: "40px", 
    overflowY: "auto",
    position: "relative"
  },

  topRightActions: {
    position: "absolute",
    top: "30px",
    right: "40px",
    zIndex: 100,
  },

  hamburgerBtn: {
    position: 'fixed',
    top: 12,
    left: 12,
    zIndex: 220,
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'none'
  },
  hamburgerLines: {
    width: 18,
    height: 2,
    background: '#a855f7',
    boxShadow: '0 6px 0 0 #a855f7, 0 -6px 0 0 #a855f7',
    borderRadius: 2,
  },

  // backdrop behind mobile sidebar
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 160,
  },

  // mobile-specific sidebar overrides
  sidebarMobile: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '260px',
    maxWidth: '80%',
    transform: 'translateX(0)',
    zIndex: 170,
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    background: 'linear-gradient(180deg, rgba(2,6,23,0.95), rgba(2,6,23,0.98))',
  },
  userDropdownTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "8px 16px",
    borderRadius: "30px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    position: "relative",
  },
  avatar: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#fff"
  },
  username: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#f8fafc"
  },
  dropdownMenu: {
    position: "absolute",
    top: "50px",
    right: "0",
    width: "150px",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    overflow: "hidden",
    padding: "5px"
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    color: "#94a3b8",
    fontSize: "14px",
    borderRadius: "8px",
    transition: "0.2s"
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
