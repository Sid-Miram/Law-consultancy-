const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User.js");
const mongoose = require('mongoose');

const chatController = {
  // Get all conversations for the current user
  getConversations: async (req, res) => {
    try {
      const conversations = await Conversation.find({
        participants: new mongoose.Types.ObjectId(req.user.userId)
      })
      .populate('participants', 'name email picture role specialization')
      .sort({ updatedAt: -1 });
      console.log("all conversations ->",conversations);
      
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Error fetching conversations' });
    }
  },

  // Get messages for a specific conversation
  getMessages: async (req, res) => {
    try {
      const messages = await Message.find({
        conversation: req.params.conversationId
      })
        .populate('sender', 'name picture')
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  },

  // Create a new conversation
  // createConversation: async (req, res) => {
  //   try {
  //     const { participantId } = req.body;
  //     console.log("participants",participantId);
      
  //     // Check if conversation already exists
  //     let conversation = await Conversation.findOne({
  //       participants: { $all: [req.user._id, participantId] }
  //     });
  //     console.log("conversation",conversation);
      
  //     if (!conversation) {
  //       conversation = new Conversation({
  //         participants: [req.user._id, participantId],
  //         lastMessage: '',
  //         unreadCount: 0
  //       });
  //       await conversation.save();
  //     }

  //     res.json(conversation);
  //   } catch (error) {
  //     console.error('Error creating conversation:', error);
  //     res.status(500).json({ error: 'Error creating conversation' });
  //   }
  // },

  createConversation: async (req, res) => {
    try {
      const { participantId } = req.body;
      console.log("participants", participantId);
  
      const myId = new mongoose.Types.ObjectId(req.user._id);
      const otherId = new mongoose.Types.ObjectId(participantId);
  
      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [myId, otherId] }
      });
      console.log("conversation", conversation);
  
      if (!conversation) {
        conversation = new Conversation({
          participants: [myId, otherId],
          lastMessage: '',
          unreadCount: 0
        });
        await conversation.save();
      }
  
      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Error creating conversation' });
    }
  },

  // Create a new message
  createMessage: async (req, res) => {
    try {
      const { content, conversationId, receiver } = req.body;
      console.log(content,conversationId,receiver);
      console.log("req.user",req.user);
      
      // Create new message
      const message = new Message({
        content,
        conversation: conversationId,
        sender: req.user.userId,
        receiver,
        read: false
      });

      console.log("message",message);
      
      await message.save();

      // Update conversation's last message and timestamp
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        updatedAt: new Date(),
        $inc: { unreadCount: 1 }
      });
      console.log("1234fjwefsbf");
      
      // Populate sender details before sending
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name picture');

      console.log("populatedMessage:-",populatedMessage);
      
      res.json(populatedMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Error creating message' });
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (req, res) => {
    try {
      const { conversationId } = req.params;

      // Update messages as read
      await Message.updateMany(
        {
          conversation: conversationId,
          receiver: req.user._id,
          read: false
        },
        { read: true }
      );

      // Reset unread count in conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        unreadCount: 0
      });

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Error marking messages as read' });
    }
  },

  // Get all lawyers (for clients)
  
};

module.exports = chatController; 