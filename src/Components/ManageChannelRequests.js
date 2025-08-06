import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageChannelRequestsCSS.css';
import { useNavigate } from 'react-router-dom';

const ManageChannelRequests = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [selectedReport, setSelectedReport] = useState(null); // 新增：当前选中行
    const [showDetailsModal, setShowDetailsModal] = useState(false); // 新增：详情弹窗
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await axios.get('https://localhost:7085/getAllChannelReports');
            // 期望字段：id, channelId, reportedById, reason, status, createdAt, reviewedAt, reviewedById
            setReports(res.data || []);
        } catch (e) {
            console.error('Failed to fetch channel reports:', e);
            setErr('Failed to fetch channel reports.');
        } finally {
            setLoading(false);
        }
    };

    const fmtDate = (val) => {
        if (!val) return '—';
        try {
            const d = new Date(val);
            if (Number.isNaN(d.getTime())) {
                return String(val).split('T')[0] || String(val);
            }
            return d.toISOString().split('T')[0];
        } catch {
            return String(val);
        }
    };

    const handleReview = async (requestId, status, e) => {
        // 防止按钮点击冒泡到行点击
        if (e) e.stopPropagation();
        try {
            await axios.put(
                `https://localhost:7085/api/channel/channels/reports/review?id=${requestId}&status=${status}`
            );
            alert(`Report ${requestId} has been ${status}.`);
            await fetchReports();
            navigate('/ManageChannelRequests'); // 根据你的路由修改
        } catch (error) {
            console.error('Failed to review report:', error);
            alert('Failed to review report. Please try again.');
        }
    };

    // 行点击：打开详情弹窗
    const handleRowClick = (report) => {
        setSelectedReport(report);
        setShowDetailsModal(true);
    };

    const pendingReports = reports.filter(
        (r) => r.status !== 'approved' && r.status !== 'rejected'
    );

    return (
        <div className="manage-channel-requests-container">
            <h2>Manage Channel Reports</h2>

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}
            {!loading && !err && pendingReports.length === 0 && (
                <div className="banner empty">No pending reports.</div>
            )}

            <table className="requests-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Channel Id</th>
                    <th>Reported By</th>
                    {/* 移除 Reason 列 */}
                    <th>Status</th>
                    <th>Reviewed At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {pendingReports.map((r) => (
                    <tr key={r.id} onClick={() => handleRowClick(r)} className="clickable-row">
                        <td>{r.id}</td>
                        <td>{r.channelId}</td>
                        <td>{r.reportedById ?? '—'}</td>
                        {/* 不显示 reason */}
                        <td>{r.status}</td>
                        <td>{fmtDate(r.reviewedAt)}</td>
                        <td className="actions-cell">
                            <button
                                className="approve-btn"
                                onClick={(e) => handleReview(r.id, 'approved', e)}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={(e) => handleReview(r.id, 'rejected', e)}
                            >
                                Reject
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 详情弹窗 */}
            {showDetailsModal && selectedReport && (
                <div
                    className="report-details-modal-overlay"
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div
                        className="report-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Report Details</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowDetailsModal(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="kv">
                                <span className="k">Id:</span>
                                <span className="v">{selectedReport.id}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Channel Id:</span>
                                <span className="v">{selectedReport.channelId}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Reported By:</span>
                                <span className="v">{selectedReport.reportedById ?? '—'}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Status:</span>
                                <span className="v">{selectedReport.status}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Created At:</span>
                                <span className="v">{fmtDate(selectedReport.createdAt)}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Reviewed At:</span>
                                <span className="v">{fmtDate(selectedReport.reviewedAt)}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Reviewed By:</span>
                                <span className="v">{selectedReport.reviewedById ?? '—'}</span>
                            </div>

                            <div className="kv col">
                                <span className="k">Reason:</span>
                                <div className="reason-box">{selectedReport.reason || '—'}</div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="approve-btn"
                                onClick={() => handleReview(selectedReport.id, 'approved')}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={() => handleReview(selectedReport.id, 'rejected')}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageChannelRequests;
