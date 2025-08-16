import React, { useEffect, useRef, useState } from 'react';
import './ChatModal.css';

const getTick = (status) => {
  if (status === 'read') {
    return <span className="chat-tick chat-tick-read">✓✓</span>;
  } else if (status === 'delivered') {
    return <span className="chat-tick">✓✓</span>;
  } else {
    return <span className="chat-tick">✓</span>;
  }
};

const ChatBox = ({ currentUser, otherUser, jobId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const wasNearBottomRef = useRef(true);

  // Fetch messages
  const fetchMessages = async () => {
    if (!otherUser?._id) {
      console.warn('No otherUser._id provided');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/messages/${otherUser._id}?jobId=${jobId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch messages:', res.status, errorText);
        setMessages([]);
        return;
      }
      const data = await res.json();
      console.log('Fetched messages:', data); // DEBUG LOG
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setInitialLoad(false);
    }
  };

  // Mark as read
  const markAsRead = async () => {
    if (!otherUser?._id) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/users/messages/${otherUser._id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });
    } catch (err) {}
  };

  // Poll for new messages and mark as read
  useEffect(() => {
    if (otherUser?._id) {
      fetchMessages();
      markAsRead();
      pollInterval.current = setInterval(() => {
        fetchMessages();
        markAsRead();
      }, 3000);
    }
    return () => clearInterval(pollInterval.current);
    // eslint-disable-next-line
  }, [otherUser?._id, jobId]);

  // Track if user is near bottom before messages update
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    wasNearBottomRef.current = isNearBottom;
    // eslint-disable-next-line
  }, [messages.length > 0 && messages[0]?._id]); // Only when new messages are about to come in

  // Remove all auto-scroll except for when the current user sends a message
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (!container) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId === currentUser.id) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentUser.id]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/users/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: otherUser._id,
          message: input,
          jobId,
        }),
      });
      setInput('');
      fetchMessages();
    } catch (err) {
      // Optionally handle error
    } finally {
      setSending(false);
    }
  };

  // Add delete message handler
  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchMessages();
      } else {
        const errorText = await res.text();
        alert('Failed to delete message: ' + errorText);
      }
    } catch (err) {
      alert('Error deleting message');
    }
  };

  if (!otherUser?._id) return null;

  return (
    <div className="chat-fullpage-container">
      <div className="chat-fullpage-header">
        <span className="chat-header-title">
          {onBack && (
            <button className="chat-back-btn" onClick={onBack} style={{ marginRight: 12, verticalAlign: 'middle' }}>&larr;</button>
          )}
          {otherUser?.name || 'Applicant'}
        </span>
      </div>
      <div className="chat-fullpage-body">
        <div className="chat-messages chat-messages-modern">
          {messages.map((msg) => {
            // Robustly check if this message was sent by the current user
            const isCurrentUser =
              String(msg.senderId) === String(currentUser.id) ||
              String(msg.senderId) === String(currentUser._id);

            // Debug log
            console.log(
              'msg.senderId:', msg.senderId,
              'currentUser.id:', currentUser.id,
              'currentUser._id:', currentUser._id,
              'isCurrentUser:', isCurrentUser
            );

            return (
              <div
                key={msg._id}
                className={`chat-message chat-message-modern ${isCurrentUser ? 'sent' : 'received'}`}
              >
                <div className="chat-message-content">{msg.message}</div>
                <div className="chat-message-meta">
                  <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isCurrentUser && getTick(msg.status)}
                  {isCurrentUser && (
                    <button
                      className="chat-delete-btn"
                      title="Delete message"
                      onClick={() => handleDeleteMessage(msg._id)}
                      style={{ marginLeft: 8, background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="chat-fullpage-footer">
        <textarea
          className="chat-input chat-input-modern"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={1}
          placeholder="Type your message..."
          disabled={sending}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="chat-send-btn chat-send-btn-modern" onClick={handleSend} disabled={sending || !input.trim()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="currentColor"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBox; 