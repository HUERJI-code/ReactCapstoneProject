import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ReviewReportedChannelCSS.css';
import { useNavigate } from "react-router";

const ReviewReportedChannel = () => {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('https://localhost:7085/getAllChannelReports');
            setReports(response.data.filter(report => report.status !== 'approved' && report.status !== 'rejected'));
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        }
    };

    const handleReview = async (reportId, status) => {
        try {
            await axios.put(`https://localhost:7085/api/channel/channels/reports/review?id=${reportId}&status=${status}`);
            alert(`Report ${reportId} has been ${status}.`);
            fetchReports();
            navigate(0); // 假设 ReviewChannelMessages 是导航目标
        } catch (error) {
            console.error("Failed to review report:", error);
            alert('Failed to review report. Please try again.');
        }
    };

    return (
        <div className="review-channel-messages-container">
            <h2>Review Channel Messages</h2>
            <table className="reports-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>ChannelId</th>
                    <th>ReportedById</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reported At</th>
                    <th>Reviewed At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {reports.map(report => (
                    <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>{report.channelId}</td>
                        <td>{report.reportedById}</td>
                        <td>{report.reason}</td>
                        <td>{report.status}</td>
                        <td>{report.reportedAt.split('T')[0]}</td>
                        <td>{report.reviewedAt ? report.reviewedAt.split('T')[0] : 'Not reviewed'}</td>
                        <td className="table-cell actions-cell">
                            <div className="btn-group">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleReview(report.id, 'approved')}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleReview(report.id, 'rejected')}
                                >
                                    Reject
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReviewReportedChannel;