import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.resolve("./data/database.sqlite"));

export function initDB() {
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL UNIQUE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS films (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cim TEXT NOT NULL,
      evszam INTEGER,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlists (
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, movie_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES films(id)
    );
  `);

  const filmCount = db.prepare("SELECT COUNT(*) AS c FROM films").get().c;
  if (filmCount === 0) {
    db.prepare(
      "INSERT INTO films (cim, evszam, user_id) VALUES (?, ?, NULL)"
    ).run("The Matrix", 1999);

    db.prepare(
      "INSERT INTO films (cim, evszam, user_id) VALUES (?, ?, NULL)"
    ).run("Inception", 2010);
  }
}

export function getDB() {
  return db;
}

export function getMovies(movie_id) {
  if (movie_id) {
    return db.prepare("SELECT * FROM films WHERE id = ?").all(movie_id);
  }
  return db.prepare("SELECT * FROM films").all();
}

export function getWatchlist(user_id) {
  return db
    .prepare(
      `
    SELECT f.*
    FROM watchlists w
    JOIN films f ON f.id = w.movie_id
    WHERE w.user_id = ?
  `
    )
    .all(user_id);
}

export function createUser(name) {
  const stmt = db.prepare("INSERT INTO users (nev) VALUES (?)");
  const result = stmt.run(name);
  return { id: Number(result.lastInsertRowid), nev: name };
}

export function getUserByName(name) {
  return db.prepare("SELECT * FROM users WHERE nev = ?").get(name);
}

export function getUserIdByName(name) {
  return db.prepare("SELECT id FROM users WHERE nev = ?").get(name);
}

export function getFilmIdByTitle(title) {
  return db
    .prepare("SELECT id FROM films WHERE lower(cim) = lower(?)")
    .get(title);
}

export function editWatchlist(userName, filmTitle) {
  const user = getUserIdByName(userName);
  if (!user) {
    throw new Error(`Nincs ilyen felhasználó: ${userName}`);
  }

  let film = getFilmIdByTitle(filmTitle);

  if (!film) {
    const created = createFilm(filmTitle);
    film = { id: created.id };
  }

  const stmt = db.prepare(
    "INSERT INTO watchlists (user_id, movie_id) VALUES (?, ?)"
  );
  return stmt.run(user.id, film.id);
}
export function createFilm(title) {
  const stmt = db.prepare(
    "INSERT INTO films (cim, evszam, user_id) VALUES (?, ?, NULL)"
  );
  const result = stmt.run(title, null);

  return {
    id: Number(result.lastInsertRowid),
    cim: title,
  };
}
