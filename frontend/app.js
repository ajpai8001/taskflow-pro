const API_BASE = "/api";
const POLL_INTERVAL_MS = 3000;
const THEME_STORAGE_KEY = "theme";

let editingTaskId = null;

const statusLabels = {
  todo: "할 일",
  in_progress: "진행 중",
  done: "완료",
};

const statusBadgeClasses = {
  todo: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  in_progress: "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100",
  done: "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100",
};

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme ? savedTheme === "dark" : prefersDark;
  applyTheme(isDark);
}

function applyTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  document.getElementById("theme-toggle-label").textContent = isDark ? "☀️" : "🌙";
}

function toggleTheme() {
  const isDark = !document.documentElement.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
}

function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDueBadge(isoString) {
  if (!isoString) return "마감 없음";
  const due = new Date(isoString);
  const now = new Date();
  const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((dueDateOnly - nowDateOnly) / (1000 * 60 * 60 * 24));
  const dLabel = diffDays === 0 ? "D-DAY" : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  const pad = (n) => String(n).padStart(2, "0");
  const timeLabel = `${pad(due.getHours())}:${pad(due.getMinutes())}`;
  return `${dLabel} ${timeLabel}`;
}

async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("작업 목록을 불러오지 못했습니다");
  return res.json();
}

async function fetchTask(taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`);
  if (!res.ok) throw new Error("작업을 불러오지 못했습니다");
  return res.json();
}

async function createTask(payload) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("작업 생성에 실패했습니다");
  return res.json();
}

async function updateTask(taskId, payload) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("작업 수정에 실패했습니다");
  return res.json();
}

async function deleteTask(taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("작업 삭제에 실패했습니다");
}

function renderTasks(tasks) {
  const listEl = document.getElementById("task-list");
  listEl.innerHTML = "";

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className =
      "rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg border border-white/30 dark:border-gray-700/50 p-4 flex items-center justify-between cursor-pointer";
    card.dataset.taskId = task.id;

    const info = document.createElement("div");
    info.className = "flex flex-col gap-1 min-w-0";

    const titleRow = document.createElement("div");
    titleRow.className = "flex items-center gap-2 flex-wrap";

    const titleEl = document.createElement("span");
    titleEl.className = "font-medium truncate";
    titleEl.textContent = task.title;

    const badge = document.createElement("span");
    badge.className = `text-xs px-2 py-0.5 rounded-xl ${statusBadgeClasses[task.status]}`;
    badge.textContent = statusLabels[task.status];

    titleRow.appendChild(titleEl);
    titleRow.appendChild(badge);

    const dueEl = document.createElement("span");
    dueEl.className = "text-sm text-gray-600 dark:text-gray-300";
    dueEl.textContent = formatDueBadge(task.due_at);

    info.appendChild(titleRow);
    info.appendChild(dueEl);

    const trashBtn = document.createElement("button");
    trashBtn.type = "button";
    trashBtn.className = "shrink-0 rounded-xl px-2 py-2 hover:bg-red-100 dark:hover:bg-red-900/40";
    trashBtn.setAttribute("aria-label", "삭제");
    trashBtn.textContent = "🗑️";
    trashBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      handleDeleteClick(task.id);
    });

    card.appendChild(info);
    card.appendChild(trashBtn);

    card.addEventListener("click", () => openEditModal(task.id));

    listEl.appendChild(card);
  });
}

async function refreshTaskList() {
  const tasks = await fetchTasks();
  renderTasks(tasks);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const dueAtValue = form.due_at.value;

  const payload = {
    title: form.title.value,
    status: form.status.value,
    due_at: dueAtValue ? new Date(dueAtValue).toISOString() : null,
  };

  await createTask(payload);
  form.reset();
  await refreshTaskList();
}

async function openEditModal(taskId) {
  const task = await fetchTask(taskId);
  editingTaskId = task.id;

  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-description").value = task.description || "";
  document.getElementById("edit-status").value = task.status;
  document.getElementById("edit-due-at").value = toDatetimeLocalValue(task.due_at);

  const modal = document.getElementById("edit-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeEditModal() {
  editingTaskId = null;
  const modal = document.getElementById("edit-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleEditSave() {
  if (editingTaskId === null) return;
  const dueAtValue = document.getElementById("edit-due-at").value;

  const payload = {
    title: document.getElementById("edit-title").value,
    description: document.getElementById("edit-description").value || null,
    status: document.getElementById("edit-status").value,
    due_at: dueAtValue ? new Date(dueAtValue).toISOString() : null,
  };

  await updateTask(editingTaskId, payload);
  closeEditModal();
  await refreshTaskList();
}

async function handleDeleteClick(taskId) {
  const confirmed = window.confirm("이 작업을 삭제하시겠습니까?");
  if (!confirmed) return;
  await deleteTask(taskId);
  await refreshTaskList();
}

function init() {
  initTheme();
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("task-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("edit-cancel").addEventListener("click", closeEditModal);
  document.getElementById("edit-save").addEventListener("click", handleEditSave);

  refreshTaskList();
  setInterval(refreshTaskList, POLL_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);
