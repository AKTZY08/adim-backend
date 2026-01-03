const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// =========================
// 🌐 Middleware
// =========================
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
  // PUBLIC ENDPOINTS
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
// 🔐 LOGIN ADMIN
// =========================
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = router.db.get("admin").value();

  if (username === admin.username && password === admin.password) {
    res.json({
      success: true,
      token: ADMIN_TOKEN,
      name: admin.name,
    });
  } else {
    res.status(401).json({ success: false, message: "Login gagal" });
  }
});

// =========================
// 🔐 GANTI PASSWORD
// =========================
server.post("/change-password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const admin = router.db.get("admin").value();

  if (oldPassword !== admin.password) {
    return res.status(400).json({ message: "Password lama salah" });
  }

  router.db.set("admin.password", newPassword).write();
  res.json({ success: true });
});

// =========================
// 📦 BOOKING (PUBLIC)
// =========================
server.post("/bookings", (req, res) => {
  const data = {
    ...req.body,
    id: Date.now(),
    status: "Menunggu",
    createdAt: new Date().toISOString(),
  };

  router.db.get("bookings").push(data).write();
  res.json(data);
});

// =========================
// 📩 KONTAK / PESAN (PUBLIC)
// =========================
server.post("/messages", (req, res) => {
  const data = {
    ...req.body,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };

  router.db.get("messages").push(data).write();
  res.json(data);
});

// =========================
// 📦 SERVICES (ADMIN)
// =========================
server.post("/services", (req, res) => {
  const data = {
    ...req.body,
    id: Date.now(),
  };
  router.db.get("services").push(data).write();
  res.json(data);
});

// =========================
// 🚍 ARMADA (ADMIN)
// =========================
server.post("/fleet", (req, res) => {
  const data = {
    ...req.body,
    id: Date.now(),
  };
  router.db.get("fleet").push(data).write();
  res.json(data);
});

// =========================
// 🔥 DEFAULT ROUTER
// =========================
server.use(router);

// =========================
// 🚀 RUN SERVER (Railway Ready)
// =========================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🔥 ADIM JSON BACKEND running on port " + PORT);
});
