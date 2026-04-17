"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, Crown, ShieldCheck, Search, Edit2, Filter, Plus, Save, X 
} from "lucide-react";

interface Member {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [currentTab, setCurrentTab] = useState<'members' | 'users'>('members');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'member'
  });

  useEffect(() => {
    const saved = localStorage.getItem("mess_user");
    if (saved) {
      const user = JSON.parse(saved);
      setUserRole(user.role);
    }

    fetchMembers();
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddMember = async () => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchMembers();
        setShowAddForm(false);
        setFormData({ username: '', email: '', role: 'member' });
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;
    try {
      const res = await fetch(`/api/members/${editingMember._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchMembers();
        setEditingMember(null);
        setFormData({ username: '', email: '', role: 'member' });
      }
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const handleApproveUser = async (userId: string, status: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const stats = {
    total: members.length,
    superAdmins: members.filter(m => m.role === 'admin').length,
    regularMembers: members.filter(m => m.role === 'member').length
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Members Management</h1>
          <p style={styles.subTitle}>Manage roles and identities for your mess</p>
        </div>
      </header>

      {userRole === 'admin' && (
        <div style={styles.tabs}>
          <button 
            style={currentTab === 'members' ? styles.activeTab : styles.inactiveTab}
            onClick={() => setCurrentTab('members')}
          >
            Mess Members
          </button>
          <button 
            style={currentTab === 'users' ? styles.activeTab : styles.inactiveTab}
            onClick={() => setCurrentTab('users')}
          >
            User Approvals
          </button>
        </div>
      )}

      {currentTab === 'members' && (
      <>
      <div style={styles.statsGrid}>
        <div style={styles.statCardGradient}>
          <div>
            <p style={styles.statLabelLight}>Total Members</p>
            <h2 style={styles.statValue}>{stats.total}</h2>
          </div>
          <div style={styles.iconBoxGlass}>
            <Users color="#fff" size={24} />
          </div>
        </div>

        <div style={styles.statCardGradient}>
          <div>
            <p style={styles.statLabelLight}>Super Admins</p>
            <h2 style={styles.statValue}>{stats.superAdmins}</h2>
          </div>
          <div style={styles.iconBoxGlass}>
            <Crown color="#fff" size={24} />
          </div>
        </div>

        <div style={styles.statCardGradient}>
          <div>
            <p style={styles.statLabelLight}>Regular Members</p>
            <h2 style={styles.statValue}>{stats.regularMembers}</h2>
          </div>
          <div style={styles.iconBoxGlass}>
            <ShieldCheck color="#fff" size={24} />
          </div>
        </div>
      </div>

      {/* BIG BOX - Reverted to Previous Dark Transparent Style */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search members..." 
              style={styles.searchInput}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.filterBtn}>
              <Filter size={18} /> Filter
            </button>
            {userRole === 'admin' && (
              <button 
                style={styles.addBtn} 
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={18} /> Add Member
              </button>
            )}
          </div>
        </div>

        {showAddForm && userRole === 'admin' && (
          <div style={styles.formContainer}>
            <h3>Add New Member</h3>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={styles.input}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={styles.saveBtn} onClick={handleAddMember}>
                <Save size={18} /> Save
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowAddForm(false)}>
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        )}

        {editingMember && userRole === 'admin' && (
          <div style={styles.formContainer}>
            <h3>Edit Member</h3>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={styles.input}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={styles.saveBtn} onClick={handleEditMember}>
                <Save size={18} /> Update
              </button>
              <button style={styles.cancelBtn} onClick={() => setEditingMember(null)}>
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        )}

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeadRow}>
              <th style={styles.th}>Member Name</th>
              <th style={styles.th}>Contact Info</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Joined Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>Loading...</td>
              </tr>
            ) : members.length > 0 ? (
              members.map((member) => (
                <tr key={member._id} style={styles.tr}>
                  <td style={styles.td}>{member.username}</td>
                  <td style={styles.td}>{member.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: member.role === 'admin' ? '#10b981' : '#6366f1'
                    }}>
                      {member.role}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {userRole === 'admin' && (
                      <button 
                        style={styles.editBtn}
                        onClick={() => {
                          setEditingMember(member);
                          setFormData({
                            username: member.username,
                            email: member.email,
                            role: member.role
                          });
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}

      {currentTab === 'users' && userRole === 'admin' && (
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={{ margin: 0, color: "#f8fafc" }}>Pending User Approvals</h3>
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Registered Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.status === 'pending').map((user) => (
                <tr key={user._id} style={styles.tr}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: '#f59e0b'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button 
                      style={styles.approveBtn}
                      onClick={() => handleApproveUser(user._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button 
                      style={styles.rejectBtn}
                      onClick={() => handleApproveUser(user._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {users.filter(u => u.status === 'pending').length === 0 && (
                <tr>
                  <td colSpan={5} style={styles.emptyCell}>
                    No pending approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px", color: "#f8fafc" },
  header: { marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "bold", margin: 0 },
  subTitle: { color: "#94a3b8", marginTop: "5px", fontSize: "14px" },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  activeTab: { 
    padding: '10px 20px', 
    background: '#6366f1', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer' 
  },
  inactiveTab: { 
    padding: '10px 20px', 
    background: 'rgba(255,255,255,0.05)', 
    color: '#94a3b8', 
    border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: '8px', 
    cursor: 'pointer' 
  },
  
  statsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
    gap: "20px",
    marginBottom: "40px" 
  },

  // Gradient Boxes using the Indigo/Purple palette from your image
  statCardGradient: {
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    padding: "24px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabelLight: { color: "rgba(255, 255, 255, 0.7)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 },
  statValue: { fontSize: "36px", fontWeight: "bold", margin: "8px 0 0 0", color: "#fff" },
  
  iconBoxGlass: { 
    background: "rgba(255, 255, 255, 0.2)", 
    padding: "12px", 
    borderRadius: "16px",
  },

  // Reverted Big Box Style
  tableContainer: {
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "28px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "24px",
    overflowX: "auto"
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "15px"
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.05)",
    padding: "12px 18px",
    borderRadius: "16px",
    flex: 1,
    border: "1px solid rgba(255,255,255,0.05)"
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    outline: "none",
    width: "100%",
    fontSize: "14px"
  },
  filterBtn: {
    background: "rgba(255,255,255,0.05)",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "10px 20px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  formContainer: {
    background: "rgba(255,255,255,0.03)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "14px"
  },
  saveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  cancelBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeadRow: { borderBottom: "1px solid rgba(255,255,255,0.1)" },
  th: { textAlign: "left", padding: "16px", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "16px", color: "#f8fafc", fontSize: "14px" },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
    textTransform: "capitalize"
  },
  editBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  approveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px"
  },
  rejectBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer"
  },
  emptyCell: { 
    padding: "60px", 
    textAlign: "center", 
    color: "#475569", 
    fontSize: "14px",
    fontStyle: "italic" 
  }
};