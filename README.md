<h1 align="center">Forward-Script</h1>

A lightweight **Telegram Channel Forwarder** with a clean web-based control panel.    
Easily forward messages from one Telegram channel to another with full control over skip IDs, last processed message, and live forwarding statistics.  

---

<p align="center">
  <img src="https://files.catbox.moe/96zqtn.jpg" alt="Control Panel Preview" />
</p>

---  
  
## Features  
- **Web UI Control Panel** – Manage everything from your browser.  
- **Set Source & Target Channels** – Change on the fly without restarting.  
- **Skip Message IDs** – Avoid forwarding unwanted messages.  
- **Real-time Stats** – See how many messages have been forwarded, skipped, or are pending.  
- **Deploy Anywhere** – Works on Render, Koyeb, or any hosting.  
  
---  
  
## Requirements  
Before running or deploying this project, you need:  
1. **Bot Token** – Create a bot using [@BotFather](https://t.me/BotFather) and copy the token.  
2. **MongoDB URI** – Get your MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/atlas) or your own MongoDB server.  
3. **Channel Access** – Add your bot as an **Admin** in both:  
   - **Source Channel** (where messages come from)  
   - **Target Channel** (where messages will be forwarded)  
   > Make sure the bot has **"Read Messages"** permission in the source channel and **"Send Messages"** permission in the target channel.  
  
---  
  
## Setup in app.js  
  
Open `app.js` and at the very top set your details:  
  
```js  
// Telegram Bot Token from @BotFather  
const BOT_TOKEN = "your_bot_token_here";  
  
// MongoDB connection string  
const MONGODB_URI = "your_mongodb_uri_here";  
```
---
## 🚀 How to Deploy

📺 **Watch the deployment video here:** [Click to Watch](https://)
