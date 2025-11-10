# WebSocket Relay Server

Real-time WebSocket relay server that connects the Chrome Extension to the Android Phone Dialer app.

## 🎯 Purpose

This server acts as a bridge:
- **Chrome Extension** → Sends phone numbers → **Server** → **Android App**
- **Android App** → Sends call status → **Server** → **Chrome Extension**

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (development)
npm run dev
```

Server will start on `http://localhost:3000`

### Test the Server

```bash
# Health check
curl http://localhost:3000

# You should see:
{
  "status": "online",
  "service": "Phone Dialer WebSocket Relay",
  "version": "1.0.0",
  "connections": {
    "extensions": 0,
    "android": 0
  },
  "uptime": 123.45
}
```

## 📡 WebSocket Protocol

### Client Identification

When a client connects, it must identify itself:

**Chrome Extension:**
```javascript
socket.emit('identify', {
  clientType: 'extension',
  userId: 'optional-user-id'
});
```

**Android App:**
```javascript
socket.emit('identify', {
  clientType: 'android',
  userId: 'optional-user-id'
});
```

### Sending Phone Numbers (Extension → Android)

```javascript
socket.emit('call_request', {
  number: '+390444784500',
  source: 'https://dashboard.example.com/contacts/123',
  timestamp: '2025-11-10T15:00:00Z'
});

// You'll receive acknowledgment:
socket.on('call_request_ack', (data) => {
  console.log(data);
  // { status: 'success', sentTo: 1, message: 'Sent to 1 Android device(s)' }
});
```

### Receiving Phone Numbers (Android)

```javascript
socket.on('message', (data) => {
  if (data.type === 'CALL_REQUEST') {
    console.log('Phone number:', data.number);
    console.log('Source:', data.source);
    console.log('Timestamp:', data.timestamp);
  }
});
```

### Sending Call Status (Android → Extension)

```javascript
socket.emit('call_status', {
  phoneNumber: '+390444784500',
  status: 'calling' | 'answered' | 'ended' | 'missed',
  timestamp: '2025-11-10T15:00:00Z'
});
```

### Receiving Call Status (Extension)

```javascript
socket.on('call_status_update', (data) => {
  console.log('Call status:', data.status);
  console.log('Phone number:', data.phoneNumber);
});
```

## 🌐 Deployment to Render

### Method 1: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your Git repository (or create a new one with this code)
4. Configure:
   - **Name**: `websocket-relay-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click **Create Web Service**

### Method 2: Using render.yaml

1. Push this repository to GitHub
2. In Render Dashboard, click **New +** → **Blueprint**
3. Connect the repository
4. Render will auto-detect `render.yaml` and deploy

### After Deployment

Your server will be available at:
```
https://websocket-relay-server-XXXX.onrender.com
```

Update your Chrome Extension and Android App configs with this URL!

## 🔧 Environment Variables

- `PORT`: Server port (default: 3000, Render sets this automatically)
- `NODE_ENV`: Environment (production/development)

## 📊 Monitoring

### Check Server Status

```bash
curl https://your-server.onrender.com/
```

### Check Health

```bash
curl https://your-server.onrender.com/health
```

### Server Logs

On Render:
1. Go to your service dashboard
2. Click **Logs** tab
3. You'll see real-time connection logs

## 🔒 Security Notes

- CORS is currently set to `*` (allow all origins) for development
- For production, update the CORS settings in `server.js` to only allow your domains:

```javascript
cors: {
  origin: [
    'chrome-extension://your-extension-id',
    'https://your-dashboard.com'
  ],
  methods: ['GET', 'POST'],
}
```

## 🐛 Troubleshooting

### Connection Issues

1. **Check if server is running**: Visit the health endpoint
2. **Check WebSocket connection**: Look at browser/app console logs
3. **Check CORS**: Make sure your origin is allowed
4. **Check Render logs**: Look for error messages

### No Messages Received

1. **Verify client identification**: Make sure you called `identify` after connecting
2. **Check server logs**: Verify messages are being received and forwarded
3. **Check network**: Firewalls might block WebSocket connections

## 📝 License

MIT

