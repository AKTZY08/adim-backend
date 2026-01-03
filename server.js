import { createRequire } from "module";
const require = createRequire(import.meta.url);

const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// LOGIN
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = router.db.get("admins").find({ username }).value();

  if (admin && admin.password === password) {
    res.json({
      success: true,
      id: admin.id,
      username: admin.username
    });
  } else {
    res.status(401).json({ message: "Login gagal" });
  }
});

server.use(router);

server.listen(port, () => {
  console.log("JSON Server running on port", port);
});
