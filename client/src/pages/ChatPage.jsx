import React, { useState, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Search } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/find-user', { withCredentials: true });
        const user = response.data;
        setCurrentUser(user);
        
        // Fetch appropriate users based on role
        const endpoint = user.role === 'client' ? '/lawyers' : '/clients';
        const usersResponse = await axios.get(`http://localhost:3000${endpoint}`, { withCredentials: true });
        
        // Filter out current user
        const filteredUsers = usersResponse.data.filter(u => u._id !== user._id);
        setUsers(filteredUsers);
        
        // Fetch conversations
        const conversationsResponse = await axios.get('http://localhost:3000/chat/conversations', { withCredentials: true });
        setConversations(conversationsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('Server is not running. Please start the server and try again.');
        } else {
          setError('Failed to load chat data. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUserSelect = async (user) => {
    try {
      setSelectedUser(user);
      setLoading(true);
      setError(null);

      // Find or create conversation
      const conversationResponse = await axios.post(
        'http://localhost:3000/chat/conversations',
        { participantId: user._id },
        { withCredentials: true }
      );

      if (!conversationResponse.data) {
        throw new Error('Failed to create conversation');
      }

      setCurrentConversation(conversationResponse.data);

      // Fetch messages for the conversation
      const messagesResponse = await axios.get(
        `http://localhost:3000/chat/messages/${conversationResponse.data._id}`,
        { withCredentials: true }
      );

      setMessages(messagesResponse.data);

      // Mark messages as read
      await axios.put(
        `http://localhost:3000/chat/messages/read/${conversationResponse.data._id}`,
        {},
        { withCredentials: true }
      );

      setLoading(false);
    } catch (err) {
      console.error('Error selecting user:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Server is not running. Please start the server and try again.');
      } else {
        setError('Failed to load conversation. Please try again later.');
      }
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    try {
      // TODO: Implement socket.io message sending
      console.log('Sending message:', message);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 mt-20">
      <div className="container mx-auto px-4 py-8 h-full">
        <div className="flex h-[calc(100vh-4rem)] bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selectedUser?._id === user._id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={user.picture || 'https://via.placeholder.com/40'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500">{user.role === 'lawyer' ? user.specialization : 'Client'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser && currentConversation ? (
              <Chat
                conversationId={currentConversation._id}
                currentUser={currentUser}
                otherUser={selectedUser}
                initialMessages={messages}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Select a user to start chatting</h3>
                  <p className="text-gray-500 mt-2">Choose from the list on the left to begin a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;