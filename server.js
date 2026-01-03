const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;

// Middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// ==========================
// 🔐 LOGIN ADMIN
// ==========================
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = router.db.get("admins").find({ username }).value();

  if (admin && admin.password === password) {
    res.json({
      success: true,
      admin
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Username atau password salah"
    });
  }
});

// ==========================
// JSON SERVER ROUTES
// ==========================
server.use("/api", router);

// ==========================
// START SERVER
// ==========================
server.listen(PORT, () => {
  console.log("JSON Server running on port", PORT);
});
