const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, "public")));

// Mapa de clientes conectados
const clients = new Map();

wss.on("connection", (ws) => {
  let userId = null;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      console.error("Mensaje inválido:", msg);
      return;
    }

    // Cuando un usuario se une
    if (data.type === "join") {
      userId = data.user;
      clients.set(userId, ws);
      console.log(`👤 ${userId} conectado`);
      return;
    }

    // Cuando un usuario envía su estado de micrófono
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

// Puerto de Render o local
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🟢 Servidor WebSocket + Express activo en puerto", PORT);
});
