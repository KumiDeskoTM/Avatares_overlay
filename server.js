const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Carpeta donde está client.html y avatars/
app.use(express.static(path.join(__dirname)));

// Mapa de clientes
const clients = new Map();

wss.on("connection", (ws) => {
  let userId = null;

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "join") {
      userId = data.user;
      clients.set(userId, ws);
      console.log(`👤 ${userId} conectado`);
      return;
    }

    if (data.type === "state") {
      for (const client of clients.values()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      }
    }
  });

  ws.on("close", () => {
    if (userId) {
      clients.delete(userId);
      console.log(`❌ ${userId} desconectado`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🟢 Servidor WebSocket + Express activo en puerto", PORT);
});