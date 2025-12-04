const API = "http://localhost:3000";

let currentUser = null;

function showGlobalAlert(message, type = "info") {
  const alertDiv = document.getElementById("global-alert");
  alertDiv.textContent = message;

  alertDiv.className = "alert app-alert";
  alertDiv.classList.add(`alert-${type}`);
  alertDiv.classList.remove("d-none");

  setTimeout(() => {
    alertDiv.classList.add("d-none");
  }, 3500);
}

function updateCurrentUserText() {
  const el = document.getElementById("current-user");
  if (currentUser) {
    el.textContent = `Bejelentkezve: ${currentUser.nev} (id: ${currentUser.id})`;
  } else {
    el.textContent = "Nem vagy bejelentkezve.";
  }
}

async function register() {
  const input = document.getElementById("reg-username");
  const resultEl = document.getElementById("reg-result");
  const username = input.value.trim();

  resultEl.classList.remove("text-error", "text-success");

  if (!username) {
    resultEl.textContent = "Adj meg egy felhasználónevet.";
    resultEl.classList.add("text-error");
    return;
  }

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();

  if (data.success) {
    resultEl.textContent = "Sikeres regisztráció. Most jelentkezz be.";
    resultEl.classList.add("text-success");
    input.value = "";
    showGlobalAlert("Sikeres regisztráció", "success");
  } else {
    resultEl.textContent = "Hiba: " + (data.error || "ismeretlen hiba");
    resultEl.classList.add("text-error");
    showGlobalAlert(resultEl.textContent, "danger");
  }
}

async function login() {
  const input = document.getElementById("login-username");
  const resultEl = document.getElementById("login-result");
  const username = input.value.trim();

  resultEl.classList.remove("text-error", "text-success");

  if (!username) {
    resultEl.textContent = "Adj meg egy felhasználónevet.";
    resultEl.classList.add("text-error");
    return;
  }

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();

  if (data.success) {
    currentUser = data.user;
    resultEl.textContent = "Sikeres belépés.";
    resultEl.classList.add("text-success");
    input.value = "";
    updateCurrentUserText();
    showGlobalAlert("Sikeres belépés", "success");
  } else {
    resultEl.textContent = "Hiba: " + (data.error || "ismeretlen hiba");
    resultEl.classList.add("text-error");
    showGlobalAlert(resultEl.textContent, "danger");
  }
}

async function loadMovies() {
  const res = await fetch(`${API}/movies`);
  const movies = await res.json();

  const tbody = document.getElementById("movie-table-body");
  tbody.innerHTML = "";

  if (!movies || movies.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = "Nincsenek filmek az adatbázisban.";
    td.classList.add("text-muted", "small");
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  movies.forEach((m) => {
    const tr = document.createElement("tr");
    tr.classList.add("app-row");

    const tdId = document.createElement("td");
    tdId.textContent = m.id;
    tdId.classList.add("small", "text-muted");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = m.cim;

    const tdYear = document.createElement("td");
    tdYear.textContent = m.evszam ?? "—";
    tdYear.classList.add("small", "text-muted", "text-end");

    tr.appendChild(tdId);
    tr.appendChild(tdTitle);
    tr.appendChild(tdYear);
    tbody.appendChild(tr);
  });
}

async function loadWatchlist() {
  if (!currentUser) {
    showGlobalAlert("Előbb jelentkezz be.", "warning");
    return;
  }

  const res = await fetch(`${API}/watchlist/${currentUser.id}`);
  const items = await res.json();

  const list = document.getElementById("watchlist-list");
  list.innerHTML = "";

  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item app-list-item muted";
    li.textContent = "Még nincsenek filmek a watchlistedben.";
    list.appendChild(li);
    return;
  }

  items.forEach((m) => {
    const li = document.createElement("li");
    li.className = "list-group-item app-list-item";

    const left = document.createElement("div");
    left.className = "d-flex flex-column";

    const title = document.createElement("span");
    title.className = "app-list-title";
    title.textContent = m.cim;

    const meta = document.createElement("span");
    meta.className = "app-list-meta";
    meta.textContent = m.evszam ? `${m.evszam}` : "Évszám nélkül";

    left.appendChild(title);
    left.appendChild(meta);

    li.appendChild(left);
    list.appendChild(li);
  });
}

async function addToWatchlist() {
  if (!currentUser) {
    showGlobalAlert("Előbb jelentkezz be.", "warning");
    return;
  }

  const input = document.getElementById("filmTitle");
  const title = input.value.trim();
  const resultEl = document.getElementById("add-result");

  resultEl.classList.remove("text-error", "text-success");

  if (!title) {
    resultEl.textContent = "Adj meg egy filmcímet.";
    resultEl.classList.add("text-error");
    return;
  }

  const res = await fetch(`${API}/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: currentUser.nev,
      filmTitle: title,
    }),
  });

  const data = await res.json();

  if (data.success) {
    resultEl.textContent = "Hozzáadtuk a watchlistedhez.";
    resultEl.classList.add("text-success");
    input.value = "";
    showGlobalAlert("Film hozzáadva a watchlisthez", "success");
  } else {
    resultEl.textContent = "Hiba: " + (data.error || "ismeretlen hiba");
    resultEl.classList.add("text-error");
    showGlobalAlert(resultEl.textContent, "danger");
  }
}

updateCurrentUserText();
