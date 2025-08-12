// ManageUserAccount.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageUserAccountCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageUserAccount = () => {
    const [users, setUsers] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false); // 新增：loading
    const [err, setErr] = useState("");            // 新增：错误提示

    // 顶部工具条状态
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/api/User");
            setUsers(res.data || []);
        } catch (error) {
            console.error("Failed to fetch users:", error?.response || error);
            setErr("Failed to fetch users.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleBanUser = async (userId) => {
        try {
            await api.put("/banUser", null, { params: { id: userId } });
            alert("User banned successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Failed to ban user:", error?.response || error);
            alert("Failed to ban user. Please try again.");
        }
    };

    const handleUnbanUser = async (userId) => {
        try {
            await api.put("/UnbanUser", null, { params: { id: userId } });
            alert("User unbanned successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Failed to unban user:", error?.response || error);
            alert("Failed to unban user. Please try again.");
        }
    };

    // ===== 所有 hooks 计算放在 return 之前 =====

    // 模糊搜索（userId/name/email/role/status）
    const filteredUsers = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const idStr = `${u.userId ?? ""}`.toLowerCase();
            const name = (u.name || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const role = (u.role || "").toLowerCase();
            const status = (u.status || "").toLowerCase();
            return (
                idStr.includes(q) ||
                name.includes(q) ||
                email.includes(q) ||
                role.includes(q) ||
                status.includes(q)
            );
        });
    }, [users, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = users.length;

        const byRole = {};
        const byStatus = {};
        users.forEach((u) => {
            const r = (u.role || "Unknown").trim();
            const s = (u.status || "Unknown").trim();
            byRole[r] = (byRole[r] || 0) + 1;
            byStatus[s] = (byStatus[s] || 0) + 1;
        });

        return { total, byRole, byStatus };
    }, [users]);

    // 初始加载为空：不显示工具条/表格
    if (!loading && !err && loaded && users.length === 0) {
        return (
            <div className="manage-user-account-container">
                <h2>Manage User Accounts</h2>
                <p className="no-user">no user</p>
            </div>
        );
    }

    return (
        <div className="manage-user-account-container">
            <h2>Manage User Accounts</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：只要初始非空（users.length > 0），之后搜索为空也不隐藏 */}
            {!loading && users.length > 0 && (
                <div className="users-header">
                    <div className="view-options">
                        <button
                            className={`overview-btn ${showOverview ? "active" : ""}`}
                            onClick={() => setShowOverview(true)}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`list-btn ${!showOverview ? "active" : ""}`}
                            onClick={() => setShowOverview(false)}
                        >
                            📋 List
                        </button>
                    </div>

                    <div className="search-wrap">
                        {showSearchBar && (
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by id / name / email / role / status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        )}
                        <button
                            className="hide-btn"
                            onClick={() => setShowSearchBar((v) => !v)}
                            title={showSearchBar ? "Hide search bar" : "Show search bar"}
                        >
                            {showSearchBar ? "⨉Hide" : "Show"}
                        </button>
                    </div>
                </div>
            )}

            {/* 主内容：表头仅在过滤后有结果时显示；无结果仅提示 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total Users</div>
                            <div className="overview-number">{overviewStats.total}</div>
                        </div>

                        <div className="overview-card wide">
                            <div className="overview-title">By Role</div>
                            <div className="badge-list">
                                {Object.keys(overviewStats.byRole).length === 0 ? (
                                    <span className="badge">No role data</span>
                                ) : (
                                    Object.entries(overviewStats.byRole).map(([k, v]) => (
                                        <span key={k} className="badge">
                      {k}: <b>{v}</b>
                    </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="overview-card wide">
                            <div className="overview-title">By Status</div>
                            <div className="badge-list">
                                {Object.keys(overviewStats.byStatus).length === 0 ? (
                                    <span className="badge">No status data</span>
                                ) : (
                                    Object.entries(overviewStats.byStatus).map(([k, v]) => (
                                        <span key={k} className="badge">
                      {k}: <b>{v}</b>
                    </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <table className="user-table">
                        <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Password Hash</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.passwordHash}</td>
                                <td>{user.role}</td>
                                <td>{user.status}</td>
                                <td>
                                    {user.status === "active" ? (
                                        <button
                                            className="ban-button"
                                            onClick={() => handleBanUser(user.userId)}
                                        >
                                            Ban
                                        </button>
                                    ) : (
                                        <button
                                            className="unban-button"
                                            onClick={() => handleUnbanUser(user.userId)}
                                        >
                                            Unban
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    users.length > 0 && (
                        <p className="no-data">No matching users</p>
                    )
                )
            )}
        </div>
    );
};

export default ManageUserAccount;
