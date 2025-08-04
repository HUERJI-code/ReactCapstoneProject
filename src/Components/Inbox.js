import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ComponentsCSS/InboxCSS.css';
import {useNavigate} from "react-router-dom";

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7085/getLoginUserMessage');
            setMessages(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Login/check');
            if (response.status === 401) {
                navigate("/OrganizerLogin")
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        checkLoginStatus();
        fetchMessages();
    }, []);

    return (
        <div className="inbox-container">
            <h2>Inbox</h2>
            {loading && <div className="loading">Loading messages...</div>}
            {error && <div className="error">{error}</div>}
            <div className="messages-list">
                {messages.map((message) => (
                    <div key={message.id} className="message-card">
                        <div className="message-header">
                            <span className="messageId">{message.id}</span>
                            <span className="timestamp">{message.sentat}</span>
                        </div>
                        <div className="message-subject">{message.title}</div>
                        <div className="message-preview">{message.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inbox;