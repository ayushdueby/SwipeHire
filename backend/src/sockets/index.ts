import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken, getUserById } from '@/lib/auth';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { Message } from '@/models/Message';
import { trackMessageSent } from '@/utils/analytics';

interface SocketUser {
  id: string;
  role: 'candidate' | 'recruiter';
  email: string;
}

type ServerToClientEvents = {
  'match:joined': (data: { matchId: string; room: string }) => void;
  'match:left': (data: { matchId: string; room: string }) => void;
  'message:new': (data: { message: { id: string; matchId: string; senderId: string; body: string; ts: Date } }) => void;
  'typing:start': (data: { matchId: string; userId: string; userEmail: string }) => void;
  'typing:stop': (data: { matchId: string; userId: string }) => void;
  'match:new': (data: { matchId: string; message: string }) => void;
  'app:error': (data: { message: string }) => void;
};

type ClientToServerEvents = {
  'join:match': (data: { matchId: string }) => void;
  'leave:match': (data: { matchId: string }) => void;
  'message:send': (data: { matchId: string; body: string }) => void;
  'typing:start': (data: { matchId: string }) => void;
  'typing:stop': (data: { matchId: string }) => void;
  'match:notify': (data: { matchId: string; targetUserId: string }) => void;
};

type AuthedSocket = Socket<ClientToServerEvents, ServerToClientEvents> & { user: SocketUser };

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = (socket as any).handshake.auth?.token || (socket as any).handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const payload = verifyToken(token);
      if (!payload || !payload.userId) {
        return next(new Error('Invalid token'));
      }

      // Find user in our database
      const user = await getUserById(payload.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Account is deactivated'));
      }

      // Attach user to socket
      (socket as AuthedSocket).user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const s = socket as AuthedSocket;
    console.log(`User ${s.user.email} connected to socket`);

    // Join user to their personal room
    s.join(`user:${s.user.id}`);

    // Handle joining match rooms
    s.on('join:match', async (data) => {
      console.log('join:match', data);
      try {
        const { matchId } = data;
        
        // Verify user is part of this match
        const match = await Match.findById(matchId);
        if (!match) {
          s.emit('app:error', { message: 'Match not found' });
          return;
        }

        const isUserInMatch = 
          (s.user.role === 'candidate' && match.candidateUserId.toString() === s.user.id) ||
          (s.user.role === 'recruiter' && match.recruiterUserId.toString() === s.user.id);

        if (!isUserInMatch) {
          s.emit('app:error', { message: 'Access denied to this match' });
          return;
        }

        // Join match room
        const roomName = `match:${matchId}`;
        s.join(roomName);
        
        console.log(`User ${s.user.email} joined match room: ${roomName}`);
        s.emit('match:joined', { matchId, room: roomName });

      } catch (error) {
        console.error('Error joining match room:', error);
        s.emit('app:error', { message: 'Failed to join match room' });
      }
    });

    // Handle leaving match rooms
    s.on('leave:match', (data) => {
      const { matchId } = data;
      const roomName = `match:${matchId}`;
      s.leave(roomName);
      
      console.log(`User ${s.user.email} left match room: ${roomName}`);
      s.emit('match:left', { matchId, room: roomName });
    });

    // Handle sending messages
    s.on('message:send', async (data) => {
      try {
        const { matchId, body } = data;

        if (!body || typeof body !== 'string' || body.trim().length === 0) {
          s.emit('app:error', { message: 'Message body is required' });
          return;
        }

        if (body.length > 2000) {
          s.emit('app:error', { message: 'Message too long' });
          return;
        }

        // Verify user is part of this match
        const match = await Match.findById(matchId);
        if (!match) {
          s.emit('app:error', { message: 'Match not found' });
          return;
        }

        const isUserInMatch = 
          (s.user.role === 'candidate' && match.candidateUserId.toString() === s.user.id) ||
          (s.user.role === 'recruiter' && match.recruiterUserId.toString() === s.user.id);

        if (!isUserInMatch) {
          s.emit('app:error', { message: 'Access denied to this match' } );
          return;
        }

        // Create and save message
        const message = new Message({
          matchId,
          senderId: s.user.id,
          body: body.trim()
        });

        await message.save();
        await message.populate('senderId', 'email');

        // Track message analytics
        await trackMessageSent(s.user.id, {
          length: body.length,
          matchId
        });

        // Emit message to all users in the match room
        const roomName = `match:${matchId}`;
        io.to(roomName).emit('message:new', {
          message: {
            id: message._id.toString(),
            matchId: message.matchId.toString(),
            senderId: message.senderId.toString(),
            body: message.body,
            ts: message.ts
          }
        });

        console.log(`Message sent in match ${matchId} by ${s.user.email}`);

      } catch (error) {
        console.error('Error sending message:', error);
        s.emit('app:error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    s.on('typing:start', (data) => {
      const { matchId } = data;
      const roomName = `match:${matchId}`;
      
      s.to(roomName).emit('typing:start', {
        matchId,
        userId: s.user.id,
        userEmail: s.user.email
      });
    });

    s.on('typing:stop', (data) => {
      const { matchId } = data;
      const roomName = `match:${matchId}`;
      
      s.to(roomName).emit('typing:stop', {
        matchId,
        userId: s.user.id
      });
    });

    // Handle new match notifications
    s.on('match:notify', (data) => {
      const { matchId, targetUserId } = data;
      
      // Notify the target user about the new match
      io.to(`user:${targetUserId}`).emit('match:new', {
        matchId,
        message: 'You have a new match!'
      });
    });

    // Handle disconnection
    s.on('disconnect', (reason) => {
      console.log(`User ${s.user.email} disconnected: ${reason}`);
    });

    // Handle errors
    (s as any).on('error', (error: any) => {
      console.error(`Socket error for user ${s.user.email}:`, error);
    });
  });

  console.log('✓ Socket.IO server initialized');
  return io;
}

export function notifyNewMatch(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>, candidateUserId: string, recruiterUserId: string, matchId: string): void {
  // Notify both users about the new match
  io.to(`user:${candidateUserId}`).emit('match:new', {
    matchId,
    message: 'You have a new match!'
  });

  io.to(`user:${recruiterUserId}`).emit('match:new', {
    matchId,
    message: 'You have a new match!'
  });
}
