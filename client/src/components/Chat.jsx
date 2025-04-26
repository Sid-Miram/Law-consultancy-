import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Paperclip, MoreVertical } from 'lucide-react';

const Chat = ({ conversationId, currentUser, otherUser, initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3000', {
      withCredentials: true
    });

    // Join conversation room
    socketRef.current.emit('join', { conversationId });

    // Listen for new messages
    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      // Mark message as read
      if (message.sender === otherUser._id) {
        axios.put(`http://localhost:3000/chat/messages/read/${conversationId}`, {}, { withCredentials: true });
      }
    });

    // Listen for typing status
    socketRef.current.on('typing', ({ isTyping }) => {
      setOtherUserTyping(isTyping);
    });

    // Clean up on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId, otherUser._id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Validate chat rules before sending
      const validationResponse = await axios.post('http://localhost:3000/chat/validate', {
        participantId: otherUser._id
      }, { withCredentials: true });

      if (!validationResponse.data.valid) {
        console.error('Invalid chat: Cannot send message');
        return;
      }

      const message = {
        content: newMessage,
        conversationId,
        sender: currentUser._id,
        receiver: otherUser._id
      };

      console.log('Sending message:', message);

      // Send message through socket
      socketRef.current.emit('message', message);

      // Save message to database
      const response = await axios.post('http://localhost:3000/chat/messages', message, {
        withCredentials: true
      });

      console.log('Message sent successfully:', response.data);

      // Add the message to local state
      setMessages((prevMessages) => [...prevMessages, response.data]);

      setNewMessage('');
      setIsTyping(false);
      socketRef.current.emit('typing', { conversationId, isTyping: false });
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.data?.error) {
        console.error('Validation error:', error.response.data.error);
      }
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', { conversationId, isTyping: true });
    }
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    socketRef.current.emit('typing', { conversationId, isTyping: false });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={otherUser.picture || 'https://via.placeholder.com/40'}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{otherUser.name}</h3>
            <p className="text-sm text-gray-500">
              {otherUser.role === 'lawyer' ? otherUser.specialization : 'Client'}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender === currentUser._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === currentUser._id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className={`text-xs mt-1 block ${
                message.sender === currentUser._id ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-500">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleTyping}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e);
              }
            }}
            onBlur={handleStopTyping}
            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 