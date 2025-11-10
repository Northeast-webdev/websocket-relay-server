# 🚀 Deployment Guide - WebSocket Relay Server

## Quick Deploy to Render (5 minutes)

### Option 1: Deploy from GitHub (Recommended)

#### Step 1: Push to GitHub

```bash
cd C:\Users\Luca\websocket-relay-server

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - WebSocket relay server"

# Create repository on GitHub: https://github.com/new
# Name it: websocket-relay-server

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/websocket-relay-server.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Click **Connect GitHub** (if not already connected)
4. Select the `websocket-relay-server` repository
5. Configure:
   - **Name**: `websocket-relay-server` (or any name you want)
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Click **Create Web Service**
7. Wait 2-3 minutes for deployment

#### Step 3: Get Your Server URL

After deployment, you'll get a URL like:
```
https://websocket-relay-server-XXXX.onrender.com
```

**Save this URL!** You'll need it for the Android app and Chrome Extension.

---

### Option 2: Deploy Without GitHub

If you don't want to use GitHub:

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Choose **Deploy an existing image or from a Git repository**
4. Select **Public Git Repository**
5. Enter: `https://github.com/YOUR_USERNAME/websocket-relay-server`
6. Continue with Step 2 above

---

## 🔧 After Deployment

### 1. Test Your Deployed Server

```bash
curl https://your-server-name.onrender.com/
```

You should see:
```json
{
  "status": "online",
  "service": "Phone Dialer WebSocket Relay",
  "version": "1.0.0",
  "connections": {
    "extensions": 0,
    "android": 0
  }
}
```

### 2. Update Android App Configuration

In your Android app, update the WebSocket URL:

**File**: `C:\Users\Luca\android-phone-dialer\src\config\index.ts`

```typescript
export const Config = {
  // ...
  WEBSOCKET_URL: 'https://your-server-name.onrender.com',
  // ...
};
```

Then rebuild the app:
```bash
cd C:\Users\Luca\android-phone-dialer
npm run android
```

### 3. Update Chrome Extension Configuration

In your Chrome Extension, update the WebSocket URL:

**File**: `C:\Users\Luca\contact management extension\src\content.js` (or wherever your WebSocket connection is)

```javascript
const socket = io('https://your-server-name.onrender.com');
```

Then reload the extension in Chrome.

---

## 📊 Monitoring

### View Logs on Render

1. Go to your service dashboard
2. Click **Logs** tab
3. See real-time connection activity

### Common Log Messages

```
✅ New connection: abc123
🔌 Chrome Extension connected: abc123
📱 Android App connected: xyz789
📞 Call request received from Extension abc123
📤 Call request sent to 1 Android device(s)
```

---

## ⚠️ Important Notes

### Render Free Tier Limitations

- **Spins down after 15 minutes of inactivity**
- **Cold start** takes 30-60 seconds when waking up
- **750 hours/month free** (enough for 24/7 if you have only one service)

### Keep Server Awake (Optional)

If you want to prevent cold starts, you can:

1. **Use a monitoring service** (like UptimeRobot) to ping your server every 10 minutes
2. **Upgrade to paid plan** ($7/month) for always-on server
3. **Accept the cold start** (first connection after idle will take 30-60 seconds)

---

## 🐛 Troubleshooting

### Server not responding
- Check Render dashboard for deployment errors
- Check logs for error messages
- Verify the URL is correct

### Android app can't connect
- Make sure you updated the WEBSOCKET_URL in config
- Rebuild the Android app after changing config
- Check if server is awake (visit the HTTP endpoint first)

### Extension can't send numbers
- Verify extension has correct server URL
- Check browser console for WebSocket errors
- Make sure extension called `identify()` after connecting

---

## 🔄 Updates

To update the server after making changes:

```bash
cd C:\Users\Luca\websocket-relay-server

# Make your changes to server.js

# Commit and push
git add .
git commit -m "Updated server logic"
git push

# Render will auto-deploy (takes 2-3 minutes)
```

---

## 📞 Need Help?

Check the main README.md for API documentation and examples.

