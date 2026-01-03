const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// =========================
// 🔐 SIMPLE TOKEN SYSTEM
// =========================
const ADMIN_TOKEN = "ADIM_ADMIN_TOKEN_2025";

// =========================
// 🔐 AUTH MIDDLEWARE
// =========================
server.use((req, res, next) => {
  if (
    req.url.startsWith("/login") ||
    req.url.startsWith("/messages") ||
    (req.method === "POST" && req.url.startsWith("/bookings"))
  ) {
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
});

// =========================
// 🔐 LOGIN
// =========================
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = router.db.get("admins").value()[0];

  if (username === admin.username && password === admin.password) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      name: admin.username,
    });
  }

  res.status(401).json({ success: false, message: "Login gagal" });
});

// =========================
// 🔐 GANTI PASSWORD
// =========================
server.post("/change-password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const admin = router.db.get("admins").value()[0];

  if (oldPassword !== admin.password) {
    return res.status(400).json({ message: "Password lama salah" });
  }

  router.db.set("admins.0.password", newPassword).write();
  res.json({ success: true });
});

// =========================
// 📦 BOOKING
// =========================
server.post("/bookings", (req, res) => {
  const data = {
    ...req.body,
    id: Date.now(),
    status: "Menunggu",
    createdAt: new Date().toISOString(),
  };

  router.db.get("booking").push(data).write();
  res.json(data);
});

// =========================
// 📩 PESAN
// =========================
server.post("/messages", (req, res) => {
  const data = { ...req.body, id: Date.now() };
  router.db.get("messages").push(data).write();
  res.json(data);
});

// =========================
// 🔥 ROUTER
// =========================
server.use(router);

// =========================
// 🚀 RUN
// =========================
server.listen(PORT, () => {
  console.log("ADIM Backend running on port " + PORT);
});
