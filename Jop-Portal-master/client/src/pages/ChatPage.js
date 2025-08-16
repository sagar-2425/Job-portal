import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatModal';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';

const ChatPage = () => {
  const { jobId, applicantId, otherUserId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Support both :applicantId and :otherUserId for backward compatibility
  const chatUserId = otherUserId || applicantId;
  const [otherUser, setOtherUser] = useState({ _id: chatUserId, name: 'User' });

  useEffect(() => {
    // Fetch other user info for display
    const fetchOtherUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/${chatUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOtherUser({ _id: data._id, name: data.name || 'User' });
        }
      } catch (err) {
        setOtherUser({ _id: chatUserId, name: 'User' });
      }
    };
    if (chatUserId) fetchOtherUser();
  }, [chatUserId]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container" style={{ maxWidth: '100%', margin: '0 auto' }}>
        <ChatBox currentUser={user} otherUser={otherUser} jobId={jobId} onBack={() => navigate(-1)} />
      </div>
    </div>
  );
};

export default ChatPage; 