import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Railway memberi port via ENV
const PORT = process.env.PORT || 3000;

// middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// LOGIN
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admins = router.db.get("admins").value();

  const admin = admins.find(
    (a) => a.username === username && a.password === password
  );

  if (admin) {
    res.json({ success: true, admin });
  } else {
    res.status(401).json({ success: false, message: "Login gagal" });
  }
});

// gunakan semua endpoint json-server
server.use(router);

// RUN SERVER
server.listen(PORT, () => {
  console.log("🚀 ADIM backend running on port", PORT);
});
