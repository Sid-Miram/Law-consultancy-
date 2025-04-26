// ChatPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatPage = () => {
  

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // The logged-in user (sender)
  const [selectedUser, setSelectedUser] = useState(null); // The selected user to chat with (receiver)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/find-user", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users", {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch messages when a user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUser) {
        try {
          const res = await axios.get(`http://localhost:3000/chat/${selectedUser._id}?senderId=${currentUser._id}`);
          setMessages(res.data);
        } catch (error) {
          console.error("Failed to fetch messages", error);
        }
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`http://localhost:3000/chat/send/${selectedUser._id}`, {
        message: newMessage,
        senderId: currentUser._id,
      });
      setNewMessage(""); // Clear the input
      // Reload messages after sending
      const res = await axios.get(`http://localhost:3000/chat/${selectedUser._id}?senderId=${currentUser._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      {/* Users Sidebar */}
      <div style={{ width: "25%", borderRight: "1px solid #ccc", overflowY: "auto", backgroundColor: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", padding: "10px" }}>Users</h2>
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: "15px",
              cursor: "pointer",
              backgroundColor: selectedUser?._id === user._id ? "#e0e0e0" : "transparent",
            }}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {selectedUser ? (
            <>
              <h3>Chatting with {selectedUser.name}</h3>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: msg.senderId === currentUser._id ? "#dcf8c6" : "#ffffff",
                    padding: "10px",
                    margin: "10px 0",
                    borderRadius: "10px",
                    alignSelf: msg.senderId === currentUser._id ? "flex-end" : "flex-start",
                    maxWidth: "60%",
                  }}
                >
                  {msg.message}
                </div>
              ))}
            </>
          ) : (
            <h3 style={{ textAlign: "center", marginTop: "50px" }}>Select a user to start chatting</h3>
          )}
        </div>

        {/* Input box */}
        {selectedUser && (
          <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                marginLeft: "10px",
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
