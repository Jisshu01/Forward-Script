// ---- this forward script is only for parsonal use so don't shere service to other ----
// ---- this script is design for high uptime and smooth expiriace
// ---- if find any error / problem then ask here "https://t.me/Jisshu_support" ----

const express = require('express');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const path = require('path');

const BOT_TOKEN = "8177452432:AAGHBV6SNBwsBvMVQA1cim_Bisf7dpxitQs";
const MONGO_URI = "mongodb+srv://isagi:isagi@cluster0.3wxdv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "forward_bot";
const COLLECTION_NAME = "config";
const FORWARD_SLEEP = 0;
const RETRY_DELAY = 5;

let mongoClient;
let db;
let configCol;
let bot;
let forwardingTask = null;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const HTML_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control Panel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .content {
            padding: 40px;
        }

        .form-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .form-section h2 {
            color: #4a5568;
            margin-bottom: 25px;
            font-size: 1.5rem;
            font-weight: 600;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2d3748;
            font-size: 0.95rem;
        }

        input[type=text], input[type=number] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #f7fafc;
        }

        input[type=text]:focus, input[type=number]:focus {
            outline: none;
            border-color: #4facfe;
            background: white;
            box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        .button-group {
            display: flex;
            gap: 15px;
            margin-top: 25px;
            flex-wrap: wrap;
        }

        button {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 140px;
            justify-content: center;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-danger {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
        }

        .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
        }

        .stats-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .stats-section h2 {
            color: #4a5568;
            margin-bottom: 25px;
            font-size: 1.5rem;
            font-weight: 600;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .stat-card {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
        }

        .stat-label {
            font-size: 0.9rem;
            color: #718096;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #2d3748;
        }

        .status-idle { color: #38a169; }
        .status-running { color: #3182ce; }
        .status-error { color: #e53e3e; }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
        }

        .notification.error {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        }

        .info-section {
            background: #e6f3ff;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 4px solid #4facfe;
        }

        .info-section h3 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 1.2rem;
        }

        .info-section p {
            color: #4a5568;
            line-height: 1.6;
        }

        @media (max-width: 768px) {
            .content {
                padding: 20px;
            }

            .header h1 {
                font-size: 2rem;
            }

            .button-group {
                flex-direction: column;
            }

            button {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Forward Panel</h2>
        </div>

        <div class="form-section">
            <form method="post" action="/save" id="configForm">
                <div class="form-group">
                    <label for="source_channel">Source Channel ID</label>
                    <input type="text" id="source_channel" name="source_channel" value="{{source_channel}}" placeholder="e.g. -1001234567890" required>
                </div>

                <div class="form-group">
                    <label for="target_channel">Target Channel ID</label>
                    <input type="text" id="target_channel" name="target_channel" value="{{target_channel}}" placeholder="e.g. -1009876543210" required>
                </div>

                <div class="form-group">
                    <label for="skip_id">Skip Message ID</label>
                    <input type="text" id="skip_id" name="skip_id" value="{{skip_id}}" placeholder="e.g. 1234 or https://t.me/c/123456789/1234" required>
                </div>

                <div class="form-group">
                    <label for="last_id">Last Message ID</label>
                    <input type="text" id="last_id" name="last_id" value="{{last_id}}" placeholder="e.g. 4567 or https://t.me/c/123456789/4567" required>
                </div>

                <div class="button-group">
                    <button type="submit" class="btn-primary" id="saveConfigBtn">
                        💾 Save
                    </button>
                    <button type="button" class="btn-secondary" onclick="startForward()" id="startForwardBtn">
                        ▶️ Start Forwarding
                    </button>
                    <button type="button" class="btn-danger" onclick="stopForward()">
                        ⏹️ Stop Forwarding
                    </button>
                </div>
            </form>
        </div>

        <div class="stats-section">
            <h2>📊 Forwarding Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Status</div>
                    <div class="stat-value" id="status">{{status}}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Forwarded</div>
                    <div class="stat-value" id="forwarded">{{forwarded}}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Skipped</div>
                    <div class="stat-value" id="skipped">{{skipped}}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pending</div>
                    <div class="stat-value" id="pending">{{pending}}</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => notification.classList.add('show'), 100);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        function updateStats() {
            fetch("/stats")
                .then(r => r.json())
                .then(data => {
                    const statusElement = document.getElementById("status");
                    statusElement.textContent = data.status;
                    statusElement.className = \`stat-value status-\${data.status}\`;

                    document.getElementById("forwarded").textContent = data.forwarded;
                    document.getElementById("skipped").textContent = data.skipped;
                    document.getElementById("pending").textContent = data.pending;

                    const saveConfigBtn = document.getElementById("saveConfigBtn");
                    const startForwardBtn = document.getElementById("startForwardBtn");
                    const isRunning = data.status === "running";

                    if (saveConfigBtn) saveConfigBtn.style.display = isRunning ? "none" : "";
                    if (startForwardBtn) startForwardBtn.style.display = isRunning ? "none" : "";
                })
                .catch(() => {
                    console.log("Failed to update stats");
                });
        }

        function startForward() {
            fetch('/start', { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) {
                        showNotification(data.message, 'success');
                    } else {
                        showNotification(data.message, 'error');
                    }
                })
                .catch(e => {
                    showNotification('Error starting forwarding', 'error');
                });
        }

        function stopForward() {
            fetch('/stop', { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    showNotification(data.message, data.ok ? 'success' : 'error');
                })
                .catch(e => {
                    showNotification('Error stopping forwarding', 'error');
                });
        }

        document.getElementById('configForm').addEventListener('submit', function(e) {
            const skipIdInput = document.getElementById('skip_id').value.trim();
            const lastIdInput = document.getElementById('last_id').value.trim();

            let skipId = parseInt(skipIdInput);
            let lastId = parseInt(lastIdInput);

            if (skipIdInput.startsWith('https://t.me/')) {
                const match = skipIdInput.match(/\\/c\\/\\d+\\/(\\d+)/);
                if (match) {
                    skipId = parseInt(match[1]);
                }
            }

            if (lastIdInput.startsWith('https://t.me/')) {
                const match = lastIdInput.match(/\\/c\\/\\d+\\/(\\d+)/);
                if (match) {
                    lastId = parseInt(match[1]);
                }
            }

            if (lastId <= skipId) {
                e.preventDefault();
                showNotification('Last Message > Skip Message ID', 'error');
                return false;
            }

            showNotification('saved', 'success');
        });

        setInterval(updateStats, 2000);

        updateStats();
    </script>
</body>
</html>`;

async function initMongoDB() {
    try {
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        db = mongoClient.db(DB_NAME);
        configCol = db.collection(COLLECTION_NAME);
        const existingConfig = await configCol.findOne({ _id: "singleton" });
        if (!existingConfig) {
            await configCol.insertOne({
                _id: "singleton",
                source_channel: "",
                target_channel: "",
                skip_id: 0,
                last_id: 0,
                status: "idle",
                forwarded: 0,
                skipped: 0,
                pending: 0,
            });
        }
        console.log("MongoDB connected ✅");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

function initTelegramBot() {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Bot running. use panel to control forwarding.");
    });
    console.log("Telegram bot initialized");
}

function extractMessageIdFromUrl(url) {
    const match = url.match(/\/c\/\d+\/(\d+)/);
    return match ? parseInt(match[1]) : null;
}

async function getConfig() {
    return await configCol.findOne({ _id: "singleton" });
}

async function updateStats(forwarded = null, skipped = null, pending = null) {
    const updateData = {};
    if (forwarded !== null) updateData.forwarded = forwarded;
    if (skipped !== null) updateData.skipped = skipped;
    if (pending !== null) updateData.pending = pending;
    if (Object.keys(updateData).length > 0) {
        await configCol.updateOne({ _id: "singleton" }, { $set: updateData });
    }
}

function isVideoOrDocument(message) {
    if (!message) return false;
    return !!(message.video || message.document || message.video_note || message.animation);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function forwardMessages() {
    try {
        const cfg = await getConfig();
        if (cfg.status !== "running") {
            console.log("Forwarding stopped");
            return;
        }
        const sourceChannel = cfg.source_channel;
        const targetChannel = cfg.target_channel;
        let currentId = cfg.skip_id + 1;
        const lastId = cfg.last_id;
        console.log(`Starting forwarding from ${currentId} to ${lastId}`);
        while (currentId <= lastId && cfg.status === "running") {
            try {
                const currentCfg = await getConfig();
                if (currentCfg.status !== "running") {
                    console.log("Forwarding stopped");
                    break;
                }
                const message = await bot.getChat(sourceChannel).then(() => {
                    return bot.copyMessage(targetChannel, sourceChannel, currentId);
                }).catch(async (error) => {
                    if (error.response && error.response.body && error.response.body.description) {
                        const description = error.response.body.description;
                        if (description.includes("message not found") || description.includes("MESSAGE_ID_INVALID")) {
                            const currentCfg = await getConfig();
                            await updateStats(
                                currentCfg.forwarded,
                                currentCfg.skipped + 1,
                                Math.max(0, lastId - currentId)
                            );
                            console.log(`Message ${currentId} not found skipping`);
                            return null;
                        }
                    }
                    throw error;
                });
                if (message) {
                    const currentCfg = await getConfig();
                    await updateStats(
                        currentCfg.forwarded + 1,
                        currentCfg.skipped,
                        Math.max(0, lastId - currentId)
                    );
                    console.log(`Forwarded message ${currentId}`);
                }
                currentId++;
                if (FORWARD_SLEEP > 0) {
                    await sleep(FORWARD_SLEEP * 1000);
                }
            } catch (error) {
                console.error(`Error forwarding message ${currentId}:`, error);
                if (error.response && error.response.body && error.response.body.parameters) {
                    const retryAfter = error.response.body.parameters.retry_after;
                    if (retryAfter) {
                        console.log(`Rate limited, waiting ${retryAfter} seconds`);
                        await sleep(retryAfter * 1000);
                        continue;
                    }
                }
                const currentCfg = await getConfig();
                await updateStats(
                    currentCfg.forwarded,
                    currentCfg.skipped + 1,
                    Math.max(0, lastId - currentId)
                );
                currentId++;
                await sleep(RETRY_DELAY * 1000);
            }
        }
        await configCol.updateOne({ _id: "singleton" }, { $set: { status: "idle" } });
        console.log("Forwarding completed");
    } catch (error) {
        console.error("Forwarding error:", error);
        await configCol.updateOne({ _id: "singleton" }, { $set: { status: "error" } });
    }
}

app.get("/", async (req, res) => {
    try {
        const cfg = await getConfig();
        let html = HTML_TEMPLATE;
        html = html.replace(/{{source_channel}}/g, cfg.source_channel || "");
        html = html.replace(/{{target_channel}}/g, cfg.target_channel || "");
        html = html.replace(/{{skip_id}}/g, cfg.skip_id || 0);
        html = html.replace(/{{last_id}}/g, cfg.last_id || 0);
        html = html.replace(/{{status}}/g, cfg.status || "idle");
        html = html.replace(/{{forwarded}}/g, cfg.forwarded || 0);
        html = html.replace(/{{skipped}}/g, cfg.skipped || 0);
        html = html.replace(/{{pending}}/g, cfg.pending || 0);
        res.send(html);
    } catch (error) {
        console.error("Error rendering page:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/stats", async (req, res) => {
    try {
        const cfg = await getConfig();
        res.json({
            status: cfg.status || "idle",
            forwarded: cfg.forwarded || 0,
            skipped: cfg.skipped || 0,
            pending: cfg.pending || 0
        });
    } catch (error) {
        console.error("Error getting stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/save", async (req, res) => {
    try {
        const { source_channel, target_channel } = req.body;
        const skipIdInput = req.body.skip_id.trim();
        const lastIdInput = req.body.last_id.trim();
        let skipIdNum = parseInt(skipIdInput) || 0;
        let lastIdNum = parseInt(lastIdInput) || 0;
        if (skipIdInput.startsWith("https://t.me/")) {
            const extractedSkipId = extractMessageIdFromUrl(skipIdInput);
            if (extractedSkipId !== null) {
                skipIdNum = extractedSkipId;
            }
        }
        if (lastIdInput.startsWith("https://t.me/")) {
            const extractedLastId = extractMessageIdFromUrl(lastIdInput);
            if (extractedLastId !== null) {
                lastIdNum = extractedLastId;
            }
        }
        if (lastIdNum <= skipIdNum) {
            return res.status(400).json({
                ok: false,
                message: "Last Message > Skip Message ID"
            });
        }
        await configCol.updateOne({ _id: "singleton" }, { $set: {
            source_channel: source_channel.trim(),
            target_channel: target_channel.trim(),
            skip_id: skipIdNum,
            last_id: lastIdNum,
            status: "idle",
            forwarded: 0,
            skipped: 0,
            pending: Math.max(0, lastIdNum - skipIdNum),
        }});
        res.redirect("/");
    } catch (error) {
        console.error("Error saving:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/start", async (req, res) => {
    try {
        const cfg = await getConfig();
        if (cfg.status === "running") {
            return res.json({
                ok: false,
                message: "already running"
            });
        }
        if (!cfg.source_channel || !cfg.target_channel) {
            return res.json({
                ok: false,
                message: "Please save target channels first"
            });
        }
        if (cfg.last_id <= cfg.skip_id) {
            return res.json({
                ok: false,
                message: "Invalid range"
            });
        }
        await configCol.updateOne({ _id: "singleton" }, { $set: { status: "running" } });
        forwardMessages().catch(console.error);
        res.json({
            ok: true,
            message: "Forwarding started"
        });
    } catch (error) {
        console.error("Error starting forwarding:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/stop", async (req, res) => {
    try {
        await configCol.updateOne({ _id: "singleton" }, { $set: { status: "idle" } });
        res.json({
            ok: true,
            message: "Forwarding stopped"
        });
    } catch (error) {
        console.error("Error stopping forwarding:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const startTime = new Date();
app.get("/ping", (req, res) => {
    const uptimeSeconds = (new Date() - startTime) / 1000;
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);
    const formatUptime = (days, hours, minutes, seconds) => {
        let result = [];
        if (days > 0) result.push(`${days} days`);
        if (hours > 0) result.push(`${hours % 24} hours`);
        if (minutes > 0) result.push(`${minutes % 60} minutes`);
        if (seconds > 0) result.push(`${Math.floor(seconds % 60)} seconds`);
        return result.join(", ") || "0 seconds";
    };
    res.json({
        status: "ok",
        message: "Server is running",
        uptime: formatUptime(uptimeDays, uptimeHours, uptimeMinutes, uptimeSeconds)
    });
});

async function startServer() {
    await initMongoDB();
    initTelegramBot();
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

process.on('SIGINT', async () => {
    console.log('down...');
    if (mongoClient) {
        await mongoClient.close();
    }
    process.exit(0);
});

startServer().catch(console.error);
