const WINNER_COUNT = 16;

const fileInput = document.getElementById("file-input");
const fileNameEl = document.getElementById("file-name");
const statsEl = document.getElementById("stats");
const participantCountEl = document.getElementById("participant-count");
const btnDraw = document.getElementById("btn-draw");
const errorEl = document.getElementById("error");
const winnersPanel = document.getElementById("winners-panel");
const winnersList = document.getElementById("winners-list");
const btnReset = document.getElementById("btn-reset");
const uploadPanel = document.getElementById("upload-panel");

/** @type {string[]} */
let participants = [];

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

function normalizeUsername(raw) {
  if (raw == null) return "";
  let s = String(raw).trim();
  if (!s) return "";
  if (s.startsWith("@")) s = s.slice(1);
  return s;
}

function isHeaderLike(value) {
  const lower = value.toLowerCase();
  return (
    lower.includes("instagram") ||
    lower.includes("usuario") ||
    lower === "user" ||
    lower === "username" ||
    lower === "nick"
  );
}

function dedupeUsernames(list) {
  const seen = new Set();
  const result = [];
  for (const name of list) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

function parseTxt(text) {
  return text
    .split(/\r?\n/)
    .map(normalizeUsername)
    .filter(Boolean);
}

function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const users = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row.length) continue;
    const cell = normalizeUsername(row[0]);
    if (!cell) continue;
    if (i === 0 && isHeaderLike(cell)) continue;
    users.push(cell);
  }
  return users;
}

function fisherYatesShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWinners(list, count) {
  return fisherYatesShuffle(list).slice(0, count);
}

function formatInstagram(name) {
  return name.startsWith("@") ? name : `@${name}`;
}

function updateParticipantUI() {
  const n = participants.length;
  participantCountEl.textContent = String(n);
  statsEl.hidden = n === 0;
  btnDraw.disabled = n < WINNER_COUNT;
  if (n > 0 && n < WINNER_COUNT) {
    showError(
      `Se necesitan al menos ${WINNER_COUNT} participantes únicos (hay ${n}).`
    );
  } else {
    showError("");
  }
}

async function handleFile(file) {
  showError("");
  participants = [];
  winnersPanel.hidden = true;
  winnersList.innerHTML = "";

  if (!file) {
    fileNameEl.textContent = "Ningún archivo seleccionado";
    updateParticipantUI();
    return;
  }

  fileNameEl.textContent = file.name;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  try {
    if (ext === "txt") {
      const text = await file.text();
      participants = dedupeUsernames(parseTxt(text));
    } else if (ext === "xlsx" || ext === "xls") {
      const buffer = await file.arrayBuffer();
      participants = dedupeUsernames(parseExcel(buffer));
    } else {
      showError("Formato no soportado. Usá .txt, .xlsx o .xls.");
      updateParticipantUI();
      return;
    }

    if (participants.length === 0) {
      showError("No se encontraron usuarios válidos en el archivo.");
    }
  } catch {
    showError("No se pudo leer el archivo. Verificá que no esté corrupto.");
    participants = [];
  }

  updateParticipantUI();
}

function renderWinners(winners) {
  winnersList.innerHTML = "";
  winners.forEach((name, index) => {
    const li = document.createElement("li");
    li.style.setProperty("--i", String(index));
    li.textContent = formatInstagram(name);
    winnersList.appendChild(li);
  });
  winnersPanel.hidden = false;
  winnersPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  void handleFile(file);
});

btnDraw.addEventListener("click", () => {
  showError("");
  if (participants.length < WINNER_COUNT) {
    showError(`Se necesitan al menos ${WINNER_COUNT} participantes.`);
    return;
  }
  const winners = pickWinners(participants, WINNER_COUNT);
  renderWinners(winners);
});

btnReset.addEventListener("click", () => {
  fileInput.value = "";
  participants = [];
  fileNameEl.textContent = "Ningún archivo seleccionado";
  statsEl.hidden = true;
  winnersPanel.hidden = true;
  winnersList.innerHTML = "";
  showError("");
  btnDraw.disabled = true;
  uploadPanel.scrollIntoView({ behavior: "smooth" });
});
