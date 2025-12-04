# filmfigyelo

📘 Filmfigyelő – Dokumentáció

Ez a dokumentáció részletesen bemutatja a Filmfigyelő alkalmazás felépítését, működését és a projekt főbb fájljait. A célja, hogy könnyen továbbfejleszthető legyen, vagy segítsen a tanulásban.

📚 Tartalomjegyzék

Projekt áttekintés

Backend

data/db.js

app.js

Frontend

index.html

script.js

style.css

Frontend–Backend kommunikáció

További fejlesztési ötletek

🎬 Projekt áttekintés

A Filmfigyelő egy egyszerű, tanulásra optimalizált webalkalmazás:

Express backend + SQLite adatbázis (better-sqlite3)

Vanilla JavaScript frontend

Apple-szerű, letisztult glassmorphism UI

Fő funkciók:

Regisztráció

Belépés

Filmlista megtekintése

Watchlist (saját filmek)

Új film hozzáadása (ha nem létezik → automatikus létrehozás)

🧠 Backend
data/db.js

A backend adatbázisrétege.
Felelős:

adatbázis kapcsolódás

táblák létrehozása

CRUD műveletek felhasználókra, filmekre, watchlistre

segédfüggvények

📌 Kapcsolódás
const db = new Database(path.resolve("./data/database.sqlite"));


Ha a fájl nem létezik → létrejön.

A kapcsolat szinkron, mert a better-sqlite3 így működik → gyorsabb és egyszerűbb.

📌 initDB()

Létrehozza a táblákat, ha hiányoznak:

users

films

watchlists

Emellett 2 alap filmet is beszúr (The Matrix, Inception), ha a tábla üres.

📌 Felhasználók

createUser(name)

getUserByName(name)

getUserIdByName(name)

Segédfüggvények a user kezeléshez.

📌 Filmek

getMovies(movie_id)

getFilmIdByTitle(title)

createFilm(title)

A keresés kis-nagybetű független (lower(cim) = lower(?)).

📌 Watchlist

getWatchlist(user_id)

editWatchlist(username, filmTitle)

Az editWatchlist logikája:

Ellenőrzi, hogy létezik-e a user.

Megkeresi a filmet.

Ha nincs → létrehozza.

Hozzáadja a watchlisthez.

app.js

Ez az Express szerver.
Felelős:

statikus fájlok kiszolgálása

API endpointok

request kezelés

adatbázis inicializáció

📌 Statikus fájlok
app.use(express.static(path.join(__dirname, "public")));


Ez szolgálja ki a public/ mappa HTML–CSS–JS fájljait.

📌 API endpointok
Regisztráció
POST /register
{
  "username": "david"
}

Belépés
POST /login
{
  "username": "david"
}

Filmek
GET /movies
GET /movies/:id

Watchlist
POST /watchlist
{
  "username": "david",
  "filmTitle": "Ace Ventura"
}

GET /watchlist/:user_id

📌 Root route

A / útvonal mindig az index.html-t adja vissza.

🎨 Frontend

A public/ mappa tartalmazza:

index.html – felépítés, UI struktúra

style.css – Apple-stílusú glassmorphism dizájn

script.js – frontend logika (API hívások, UI frissítés)

index.html

Felépítése:

1. Háttér rétegek

több radial-gradient

blur réteg
→ Apple-szerű design

2. Fejléc

logó

alkalmazás neve

bejelentkezett felhasználó státusza

3. Bal oszlop
Regisztráció / belépés kártya

kapszula alakú input mezők

primer és ghost gombok

Film hozzáadás

új film címe

zöld “Hozzáadás” gomb

4. Jobb oszlop
Filmtár

minimal táblázat (borderless)

Watchlist

kártyaszerű listaelemek

cím + év külön sorokban

script.js

A frontend logika.

📌 Globális állapot
const API = "http://localhost:3000";
let currentUser = null;

📌 Funkciók
Függvény	Mit csinál
register()	Regisztráció API hívása
login()	Belépés API hívása
loadMovies()	Filmtár betöltése
loadWatchlist()	Watchlist betöltése
addToWatchlist()	Új film hozzáadása
showGlobalAlert()	Apple-szerű üzenet buborék
updateCurrentUserText()	Fejléc frissítése
📌 API hívások típusa

fetch(apiUrl, { method, headers, body })

JSON parse-olás: .json()

hibakezelés: try/catch vagy feltételek alapján

style.css

A teljes dizájn motorja.

🎨 Fő stílusjegyek

Glassmorphism

áttetsző kártyák

blur

Világos, minimal UI

Apple-szerű lekerekített formák

Kapszulás input és gombok

Soft shadow + light gradients

Fontosabb blokkok:
Blokk	Mit tartalmaz
:root	színek, radiusok, árnyékok
.app-bg, .app-bg-blur	háttér és blur
.glass-card	kártyák designja
.app-input	input mezők stílusa
.app-btn-primary	fő gomb (kék)
.app-btn-accent	zöld “hozzáadás” gomb
.app-table	film lista
.app-list-item	watchlist elemek
🔌 Frontend–Backend kommunikáció

Kommunikáció HTTP-n keresztül JSON body-val:

sequenceDiagram
    Frontend->>Backend: POST /login { username }
    Backend-->>Frontend: { success: true, user }

    Frontend->>Backend: GET /movies
    Backend-->>Frontend: [ {id, cim, evszam}, ... ]

    Frontend->>Backend: POST /watchlist { username, filmTitle }
    Backend-->>Frontend: success


A frontend nem tárol tokeneket vagy jelszót, ez egy egyszerű tanulóprojekt.

🚀 További fejlesztési ötletek
🔐 1. Valódi jelszavas login

bcryptjs jelszó-hash

users táblában jelszo_hash mező

🎞️ 2. Filmekhez több adat:

rendező

műfaj

IMDb link

borítókép

❌ 3. Film törlése a watchlistből

új route: DELETE /watchlist

UI-ban kis “X” ikon

🎨 4. Dark/Light mód váltás

CSS változós téma rendszer

📱 5. Mobil optimalizálás

responsive breakpoints finomítása
