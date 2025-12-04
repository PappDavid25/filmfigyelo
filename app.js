import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  initDB,
  getMovies,
  editWatchlist,
  getWatchlist,
  createUser,
  getUserByName,
} from "./data/db.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

initDB();

app.get("/movies", (req, res) => {
  const movies = getMovies();
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movies = getMovies(id);

  if (!movies || movies.length === 0) {
    return res.status(404).json({ error: "Film nem található" });
  }
  res.json(movies);
});

app.post("/register", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username kötelező" });
  }

  const existing = getUserByName(username);
  if (existing) {
    return res.status(400).json({ error: "Már létezik ilyen felhasználó" });
  }

  try {
    const user = createUser(username);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message || "Regisztrációs hiba" });
  }
});

app.post("/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username kötelező" });
  }

  const user = getUserByName(username);
  if (!user) {
    return res.status(400).json({ error: "Nincs ilyen felhasználó" });
  }

  res.json({
    success: true,
    user: { id: user.id, nev: user.nev },
  });
});

app.post("/watchlist", (req, res) => {
  const { username, filmTitle } = req.body;

  if (!username || !filmTitle) {
    return res.status(400).json({ error: "username és filmTitle kell!" });
  }

  try {
    const result = editWatchlist(username, filmTitle);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/watchlist/:user_id", (req, res) => {
  const { user_id } = req.params;
  const list = getWatchlist(user_id);
  res.json(list);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
