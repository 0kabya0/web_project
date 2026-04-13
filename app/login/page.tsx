"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, User, Lock, Mail, ShieldCheck, Users, Key, ArrowRight, LogIn } from "lucide-react"; 

export default function SignupPage() {
  const [step, setStep] = useState(1); 
  const [role, setRole] = useState("other"); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const router = useRouter();

  const ADMIN_CREDS = {
    username: "Admin",
    password: "123",
    email: "admin@gmail.com"
  };

  // --- FRONTEND LOGIC: LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Priority Check: Admin access
    if (userId === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        localStorage.setItem("mess_user", JSON.stringify({ 
            username: userId, 
            role: "admin", 
            isNew: false 
        }));
        router.push("/dashboard");
        return; 
    }

    // 2. Regular User check from LocalStorage
    const savedData = localStorage.getItem("mess_user");
    if (!savedData) {
      alert("No account found! Please Sign Up first.");
      return;
    }

    const user = JSON.parse(savedData);
    if (user.username === userId && user.password === password) {
      localStorage.setItem("mess_user", JSON.stringify({ 
        ...user, isNew: false 
      }));
      alert(`Welcome back, ${user.username}!`);
      router.push("/dashboard");
    } else {
      alert("Invalid Username or Password.");
    }
  };

  // --- FRONTEND LOGIC: SIGNUP (OTP STEP) ---
  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      // Direct login for admin role during signup attempt
      if (userId === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        localStorage.setItem("mess_user", JSON.stringify({ 
            username: userId, role: "admin", email: ADMIN_CREDS.email, isNew: false 
        }));
        router.push("/dashboard");
      } else {
        alert("Invalid Admin Credentials!");
      }
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep(2);
    alert(`[MESS MASTER] Verification code sent to ${email}\n\nYOUR CODE: ${code}`);
  };

  // --- FRONTEND LOGIC: OTP VERIFICATION ---
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      localStorage.setItem("mess_user", JSON.stringify({ 
          username: userId, email: email, role: "other", password: password, isNew: true 
      }));
      router.push("/dashboard");
    } else {
      alert("Wrong OTP!");
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .floating-card {
          animation: float 4s ease-in-out infinite;
        }
        input:focus {
          border-color: #3b82f6 !important;
          background: rgba(255,255,255,0.08) !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .btn-hover:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        button:active {
          transform: scale(0.95);
        }
      `}</style>

      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      <div style={styles.blob3}></div>

      <div style={styles.card} className="floating-card">
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Home size={32} color="#fff" />
          </div>
          <h1 style={styles.appName}>MESS MASTER</h1>
          <p style={styles.subtitle}>
            {isLoggingIn ? "Secure Login" : (step === 1 ? "System Access" : "Verify Email")}
          </p>
        </div>

        {isLoggingIn ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputWrapper}>
              <User style={styles.fieldIcon} size={20}/><input type="text" placeholder="Username" style={styles.input} value={userId} onChange={(e)=>setUserId(e.target.value)} required />
            </div>
            <div style={styles.inputWrapper}>
              <Lock style={styles.fieldIcon} size={20}/><input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={styles.button} className="btn-hover">Sign In <LogIn size={18} /></button>
            <div style={styles.footerText}>
               New user? <button type="button" onClick={() => setIsLoggingIn(false)} style={styles.textLink}>Create an Account</button>
            </div>
          </form>
        ) : (
          step === 1 ? (
            <form onSubmit={handleAction} style={styles.form}>
              <div style={styles.roleContainer}>
                <button type="button" onClick={() => setRole("admin")} style={role === "admin" ? styles.activeRole : styles.inactiveRole}><ShieldCheck size={16}/> Admin</button>
                <button type="button" onClick={() => setRole("other")} style={role === "other" ? styles.activeRole : styles.inactiveRole}><Users size={16}/> Other</button>
              </div>
              <div style={styles.inputWrapper}>
                <User style={styles.fieldIcon} size={20}/><input type="text" placeholder="Username" style={styles.input} value={userId} onChange={(e)=>setUserId(e.target.value)} required />
              </div>
              {role === "other" && (
                <div style={styles.inputWrapper}>
                  <Mail style={styles.fieldIcon} size={20}/><input type="email" placeholder="Gmail Address" style={styles.input} value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
              )}
              <div style={styles.inputWrapper}>
                <Lock style={styles.fieldIcon} size={20}/><input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>
              <button type="submit" style={styles.button} className="btn-hover">
                {role === "admin" ? "Login as Admin" : "Send OTP"} <ArrowRight size={18} />
              </button>
              <div style={styles.footerText}>
                Already have an account? <button type="button" onClick={() => setIsLoggingIn(true)} style={styles.textLink}>Sign In</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={styles.form}>
              <p style={styles.otpText}>Enter code sent to <b>{email}</b></p>
              <div style={styles.inputWrapper}>
                <Key style={styles.fieldIcon} size={20}/><input type="text" placeholder="6-Digit OTP" style={styles.input} value={otp} onChange={(e)=>setOtp(e.target.value)} required />
              </div>
              <button type="submit" style={styles.button} className="btn-hover">Verify & Continue</button>
              <button type="button" onClick={() => setStep(1)} style={styles.backBtn}>Back to Signup</button>
            </form>
          )
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#020617", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "absolute", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", top: "-10%", left: "-10%" },
  blob2: { position: "absolute", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", bottom: "-10%", right: "-10%" },
  blob3: { position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", top: "40%", left: "40%" },
  card: { backgroundColor: "rgba(255, 255, 255, 0.03)", padding: "40px", borderRadius: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.1)", zIndex: 10 },
  header: { textAlign: "center", marginBottom: "30px" },
  iconCircle: { background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", width: "64px", height: "64px", borderRadius: "18px", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 16px", boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)" },
  appName: { fontSize: "30px", fontWeight: "900", color: "#f8fafc", margin: 0, letterSpacing: "-1px" },
  subtitle: { fontSize: "14px", color: "#94a3b8", marginTop: "4px" },
  roleContainer: { display: "flex", gap: "10px", marginBottom: "20px", background: "rgba(255,255,255,0.05)", padding: "5px", borderRadius: "14px" },
  activeRole: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", border: "none", borderRadius: "10px", background: "#3b82f6", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  inactiveRole: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", border: "none", borderRadius: "10px", background: "transparent", color: "#64748b", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  fieldIcon: { position: "absolute", left: "16px", color: "#64748b" },
  input: { width: "100%", padding: "14px 14px 14px 48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", outline: "none", background: "rgba(255,255,255,0.05)", color: "#f8fafc", fontSize: "15px", transition: "0.2s" },
  button: { padding: "16px", background: "#f8fafc", color: "#020617", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "16px", transition: "0.3s" },
  footerText: { fontSize: "13px", color: "#94a3b8", textAlign: "center", marginTop: "10px" },
  textLink: { background: "none", border: "none", color: "#3b82f6", fontWeight: "700", cursor: "pointer", padding: "0 4px", fontSize: "13px" },
  otpText: { fontSize: "14px", color: "#94a3b8", textAlign: "center", marginBottom: "8px" },
  backBtn: { background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", marginTop: "10px" }
};