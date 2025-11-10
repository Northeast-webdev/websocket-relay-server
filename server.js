import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json());

// Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for now (you can restrict this later)
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Store connected clients
const clients = {
  extensions: new Map(), // Chrome Extensions
  android: new Map(),    // Android Apps
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Phone Dialer WebSocket Relay',
    version: '1.0.0',
    connections: {
      extensions: clients.extensions.size,
      android: clients.android.size,
    },
    uptime: process.uptime(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] ✅ New connection: ${socket.id}`);

  // Client identification
  socket.on('identify', (data) => {
    const { clientType, userId } = data;
    
    if (clientType === 'extension') {
      clients.extensions.set(socket.id, { socket, userId, connectedAt: new Date() });
      console.log(`[${new Date().toISOString()}] 🔌 Chrome Extension connected: ${socket.id} (User: ${userId || 'anonymous'})`);
      console.log(`[${new Date().toISOString()}] 📊 Active connections - Extensions: ${clients.extensions.size}, Android: ${clients.android.size}`);
      
      socket.emit('identified', { clientType: 'extension', status: 'connected' });
    } 
    else if (clientType === 'android') {
      clients.android.set(socket.id, { socket, userId, connectedAt: new Date() });
      console.log(`[${new Date().toISOString()}] 📱 Android App connected: ${socket.id} (User: ${userId || 'anonymous'})`);
      console.log(`[${new Date().toISOString()}] 📊 Active connections - Extensions: ${clients.extensions.size}, Android: ${clients.android.size}`);
      
      socket.emit('identified', { clientType: 'android', status: 'connected' });
    }
    else {
      console.log(`[${new Date().toISOString()}] ⚠️ Unknown client type: ${clientType}`);
    }
  });

  // Handle phone number from Chrome Extension
  socket.on('call_request', (data) => {
    const { number, source, timestamp } = data;
    
    console.log(`[${new Date().toISOString()}] 📞 Call request received from Extension ${socket.id}:`);
    console.log(`   Number: ${number}`);
    console.log(`   Source: ${source}`);
    console.log(`   Timestamp: ${timestamp}`);

    // Relay to all connected Android apps
    let sentCount = 0;
    clients.android.forEach((client) => {
      try {
        client.socket.emit('message', {
          type: 'CALL_REQUEST',
          number: number,
          source: source,
          timestamp: timestamp || new Date().toISOString(),
        });
        sentCount++;
        console.log(`[${new Date().toISOString()}] ✅ Forwarded to Android: ${client.socket.id}`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Failed to send to Android ${client.socket.id}:`, error.message);
      }
    });

    // Send acknowledgment back to extension
    socket.emit('call_request_ack', {
      status: 'success',
      sentTo: sentCount,
      message: sentCount > 0 ? `Sent to ${sentCount} Android device(s)` : 'No Android devices connected',
    });

    if (sentCount === 0) {
      console.log(`[${new Date().toISOString()}] ⚠️ No Android devices connected to receive the call request`);
    } else {
      console.log(`[${new Date().toISOString()}] 📤 Call request sent to ${sentCount} Android device(s)`);
    }
  });

  // Handle call status updates from Android
  socket.on('call_status', (data) => {
    const { phoneNumber, status, timestamp } = data;
    
    console.log(`[${new Date().toISOString()}] 📊 Call status update from Android ${socket.id}:`);
    console.log(`   Number: ${phoneNumber}`);
    console.log(`   Status: ${status}`);
    console.log(`   Timestamp: ${timestamp}`);

    // Relay status to all connected extensions
    clients.extensions.forEach((client) => {
      try {
        client.socket.emit('call_status_update', {
          phoneNumber,
          status,
          timestamp: timestamp || new Date().toISOString(),
        });
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Failed to send status to Extension ${client.socket.id}:`, error.message);
      }
    });
  });

  // Handle generic messages
  socket.on('message', (data) => {
    console.log(`[${new Date().toISOString()}] 📨 Message from ${socket.id}:`, data);
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[${new Date().toISOString()}] ❌ Disconnected: ${socket.id} (Reason: ${reason})`);

    // Remove from appropriate client list
    if (clients.extensions.has(socket.id)) {
      clients.extensions.delete(socket.id);
      console.log(`[${new Date().toISOString()}] 🔌 Chrome Extension disconnected: ${socket.id}`);
    } else if (clients.android.has(socket.id)) {
      clients.android.delete(socket.id);
      console.log(`[${new Date().toISOString()}] 📱 Android App disconnected: ${socket.id}`);
    }

    console.log(`[${new Date().toISOString()}] 📊 Active connections - Extensions: ${clients.extensions.size}, Android: ${clients.android.size}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] ❌ Socket error on ${socket.id}:`, error);
  });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 WebSocket Relay Server Started!');
  console.log('========================================');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('========================================');
  console.log('');
  console.log('Waiting for connections...');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[SIGTERM] Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[SIGINT] Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

