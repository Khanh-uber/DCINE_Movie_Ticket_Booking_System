const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.json());

// 1. Socket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", ({ transactionId }) => {
    socket.join(transactionId);
    console.log(`Client ${socket.id} joined room ${transactionId}`);
  });
});

// 2. API để BE gọi emit
app.post("/emit-payment", (req, res) => {
  const data = req.body; // { payment: {...} }

  const transId = data.payment.transactionId;

  // Emit realtime
  io.to(transId).emit("payment_success", data);

  console.log("Emitted payment_success to room:", transId);

  res.json({ success: true });
});

// 3. Start server
server.listen(3001, () => {
  console.log("Socket server running on port 3001");
});
