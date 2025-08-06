import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageChannelCreateRequestCSS.css';
import { useNavigate } from 'react-router-dom';

const ManageChannelCreateRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await axios.get('https://localhost:7085/getChannelRequests');
            let data = res.data || [];

            // 按 requestedAt 从早到晚排序
            data.sort((a, b) => {
                const aTime = new Date(a.requestedAt).getTime();
                const bTime = new Date(b.requestedAt).getTime();
                return aTime - bTime; // 早的在前
            });

            setRequests(data);
            console.log(data);
        } catch (e) {
            console.error('Failed to fetch channel create requests:', e);
            setErr('Failed to fetch channel create requests.');
        } finally {
            setLoading(false);
        }
    };


    const fmtDate = (val) => {
        if (!val) return '—';
        try {
            const d = new Date(val);
            if (Number.isNaN(d.getTime())) return String(val).split('T')[0] || String(val);
            return d.toISOString().split('T')[0];
        } catch {
            return String(val);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await axios.put(
                `https://localhost:7085/api/channel/review/${requestId}?status=${status}`
                // 如果后端目前写死为3，请改成：
                // 'https://localhost:7085/api/channel/review/3?status=' + status
            );
            alert(`Request ${requestId} has been ${status}.`);
            await fetchRequests();
            navigate('/ManageChannelCreateRequest'); // 按你的路由实际修改
        } catch (error) {
            console.error('Failed to review request:', error);
            alert('Failed to review request. Please try again.');
        }
    };

    // 仅保留 pending
    const pending = (requests || []).filter((r) => (r.status || '').toLowerCase() === 'pending');

    return (
        <div className="manage-channel-create-requests-container">
            <h2>Manage Channel Create Requests</h2>

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}
            {!loading && !err && pending.length === 0 && (
                <div className="banner empty">No pending requests.</div>
            )}

            <table className="requests-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Channel Name</th>
                    <th>Description</th>
                    <th>Requested By</th>
                    <th>Requested At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {pending.map((r) => (
                    <tr key={r.id}>
                        <td>{r.id}</td>
                        <td className="limit-text" title={r.channel.name}>{r.channel.name || '—'}</td>
                        <td className="limit-text" title={r.channel.description}>{r.channel.description || '—'}</td>
                        <td>{r.user.name ?? '—'}</td>
                        <td>{r.requestedAt.split('T')[0] ?? '—'}</td>
                        <td className="actions-cell">
                            <button
                                className="approve-btn"
                                onClick={() => handleReview(r.id, 'approved')}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={() => handleReview(r.id, 'rejected')}
                            >
                                Reject
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageChannelCreateRequest;
