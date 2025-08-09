import React, { useState, useEffect } from "react";
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

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/api/User");
            setUsers(res.data || []);
            // console.log(res.data);
        } catch (error) {
            console.error("Failed to fetch users:", error?.response || error);
            alert("Failed to fetch users.");
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

    return (
        <div className="manage-user-account-container">
            <h2>Manage User Accounts</h2>
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
                {users.map((user) => (
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
        </div>
    );
};

export default ManageUserAccount;
