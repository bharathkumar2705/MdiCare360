const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const onlineUsers = new Map();

const initializeSockets = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Personal room for notifications

    io.emit('user:online', { userId });

    // ─── Messaging ─────────────────────────────────────────────
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content, attachments } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.toString() === userId)) {
          return socket.emit('error', { message: 'Not authorized for this conversation.' });
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          content,
          attachments: attachments || [],
          readBy: [{ userId }],
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populated = await message.populate('senderId', 'name avatar');

        io.to(`conv:${conversationId}`).emit('message:received', populated);

        // Notify offline participants
        conversation.participants.forEach((participantId) => {
          const pid = participantId.toString();
          if (pid !== userId && !onlineUsers.has(pid)) {
            // They're offline — notification will be created via background job
          }
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('message:typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('message:typing', { userId, conversationId });
    });

    socket.on('message:stop-typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('message:stop-typing', { userId, conversationId });
    });

    socket.on('message:read', async ({ conversationId, messageId }) => {
      try {
        await Message.updateMany(
          { conversationId, 'readBy.userId': { $ne: userId } },
          { $push: { readBy: { userId } } }
        );
        io.to(`conv:${conversationId}`).emit('message:read-receipt', { userId, conversationId });
      } catch {}
    });

    // ─── WebRTC Signaling ───────────────────────────────────────
    socket.on('webrtc:join-room', ({ roomId }) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('webrtc:user-joined', { userId, socketId: socket.id });
    });

    socket.on('webrtc:offer', ({ roomId, offer, targetSocketId }) => {
      io.to(targetSocketId).emit('webrtc:offer', { offer, from: socket.id });
    });

    socket.on('webrtc:answer', ({ answer, targetSocketId }) => {
      io.to(targetSocketId).emit('webrtc:answer', { answer, from: socket.id });
    });

    socket.on('webrtc:ice-candidate', ({ candidate, targetSocketId }) => {
      io.to(targetSocketId).emit('webrtc:ice-candidate', { candidate, from: socket.id });
    });

    socket.on('webrtc:leave-room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('webrtc:user-left', { userId, socketId: socket.id });
    });

    // ─── Notifications push ─────────────────────────────────────
    socket.on('notification:subscribe', () => {
      socket.join(`notifications:${userId}`);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
    });
  });

  return { onlineUsers };
};

const sendNotificationToUser = (io, userId, notification) => {
  io.to(userId).emit('notification:new', notification);
};

module.exports = { initializeSockets, sendNotificationToUser, onlineUsers };
