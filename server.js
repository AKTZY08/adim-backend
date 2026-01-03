const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Token
const ADMIN_TOKEN = "ADIM_ADMIN_TOKEN_2025";

// Auth middleware
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

// Login
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = router.db.get("admins").value()[0];

  if (username === admin.username && password === admin.password) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN
    });
  }

  res.status(401).json({ message: "Login gagal" });
});

// Booking publik
server.post("/bookings", (req, res) => {
  const data = {
    ...req.body,
    id: Date.now(),
    status: "Menunggu"
  };
  router.db.get("booking").push(data).write();
  res.json(data);
});

// Messages publik
server.post("/messages", (req, res) => {
  const data = { ...req.body, id: Date.now() };
  router.db.get("messages").push(data).write();
  res.json(data);
});

// Default routes
server.use(router);

// Port Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("ADIM backend running on port", PORT);
});
