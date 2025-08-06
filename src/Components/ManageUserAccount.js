import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageUserAccountCSS.css';

const ManageUserAccount = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/User');
            setUsers(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const handleBanUser = async (userId) => {
        try {
            await axios.put(`https://localhost:7085/banUser?id=${userId}`);
            alert('User banned successfully!');
            fetchUsers(); // Refresh users list after ban
        } catch (error) {
            console.error("Failed to ban user:", error);
            alert('Failed to ban user. Please try again.');
        }
    };

    const handleUnbanUser = async (userId) => {
        try {
            await axios.put(`https://localhost:7085/UnbanUser?id=${userId}`);
            alert('User unbanned successfully!');
            fetchUsers(); // Refresh users list after unban
        } catch (error) {
            console.error("Failed to unban user:", error);
            alert('Failed to unban user. Please try again.');
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
                {users.map(user => (
                    <tr key={user.userId}>
                        <td>{user.userId}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.passwordHash}</td>
                        <td>{user.role}</td>
                        <td>{user.status}</td>
                        <td>
                            {user.status === 'active' ? (
                                <button className="ban-button" onClick={() => handleBanUser(user.userId)}>Ban</button>
                            ) : (
                                <button className="unban-button" onClick={() => handleUnbanUser(user.userId)}>Unban</button>
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