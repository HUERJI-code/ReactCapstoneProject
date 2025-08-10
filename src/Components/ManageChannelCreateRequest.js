import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageChannelCreateRequestCSS.css";
import { useNavigate } from "react-router-dom";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageChannelCreateRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getChannelRequests");
            let data = res.data || [];

            // 按 requestedAt 从早到晚排序
            data.sort((a, b) => {
                const aTime = new Date(a.requestedAt).getTime();
                const bTime = new Date(b.requestedAt).getTime();
                return aTime - bTime;
            });

            setRequests(data);
        } catch (e) {
            console.error("Failed to fetch channel create requests:", e?.response || e);
            setErr("Failed to fetch channel create requests.");
            if (e?.response?.status === 401) navigate("/adminLogin");
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await api.put(`/api/channel/review/${requestId}`, null, {
                params: { status }, // → ?status=approved / rejected
            });
            alert(`Request ${requestId} has been ${status}.`);
            await fetchRequests();
            navigate("/ManageChannelCreateRequest");
        } catch (error) {
            console.error("Failed to review request:", error?.response || error);
            alert("Failed to review request. Please try again.");
        }
    };

    // 仅保留 pending
    const pending = (requests || []).filter(
        (r) => (r.status || "").toLowerCase() === "pending"
    );

    // ===== 空状态：加载完成且无待审核 → 标题 + 提示（居中） =====
    if (!loading && !err && pending.length === 0) {
        return (
            <div className="manage-channel-create-requests-container">
                <h2 style={{ textAlign: "center" }}>Manage Channel Create Requests</h2>
                <p className="no-data">no pending requests</p>
            </div>
        );
    }

    return (
        <div className="manage-channel-create-requests-container">
            <h2>Manage Channel Create Requests</h2>

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {!loading && !err && (
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
                            <td className="limit-text" title={r.channel?.name}>
                                {r.channel?.name || "—"}
                            </td>
                            <td className="limit-text" title={r.channel?.description}>
                                {r.channel?.description || "—"}
                            </td>
                            <td>{r.user?.name ?? "—"}</td>
                            <td>{(r.requestedAt || "").split("T")[0]}</td>
                            <td className="actions-cell">
                                <button
                                    className="approve-btn"
                                    onClick={() => handleReview(r.id, "approved")}
                                >
                                    Approve
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={() => handleReview(r.id, "rejected")}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageChannelCreateRequest;
