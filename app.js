const STORAGE_KEY = "todo-app-tasks";
const SETTINGS_KEY = "todo-app-settings";
const DEFAULT_SETTINGS = { blockedSites: [], theme: "light" };

const addForm = document.getElementById("addForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");

let tasks = loadTasks();
let currentFilter = "all";

function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(data);
    return {
      blockedSites: Array.isArray(parsed.blockedSites) ? parsed.blockedSites : [],
      theme: ["light", "dark", "auto"].includes(parsed.theme) ? parsed.theme : "light",
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme || loadSettings().theme;
}

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const TAGS = ["Personal", "Work", "Misc"];
const PRIORITIES = ["red", "yellow", "green"];

function openDatePicker(pendingText) {
  const modal = document.getElementById("dateModal");
  const input = document.getElementById("dueDateInput");
  const today = new Date().toISOString().slice(0, 10);
  input.min = today;
  input.value = "";
  document.querySelectorAll(".tag-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tag === "Misc");
  });
  document.querySelectorAll(".priority-dot").forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.priority === "green");
  });
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  input.focus();
  window._pendingTaskText = pendingText;
}

function closeDatePicker() {
  const modal = document.getElementById("dateModal");
  modal.hidden = true;
  document.body.style.overflow = "";
  window._pendingTaskText = null;
}

function addTask(text, dueDate = null, tag = "Misc", priority = "green") {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.push({
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
    dueDate: dueDate || null,
    tag: TAGS.includes(tag) ? tag : "Misc",
    priority: PRIORITIES.includes(priority) ? priority : "green",
  });
  saveTasks();
  render();
  taskInput.value = "";
  taskInput.focus();
}

function formatDueDate(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T12:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (taskDate.getTime() === today.getTime()) return "Today";
  if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.done);
  if (currentFilter === "completed") return tasks.filter((t) => t.done);
  return tasks;
}

function render() {
  const filtered = getFilteredTasks();
  const activeCount = tasks.filter((t) => !t.done).length;

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent =
      currentFilter === "all"
        ? "No tasks yet. Add one above."
        : currentFilter === "active"
          ? "No active tasks."
          : "No completed tasks.";
    taskList.appendChild(li);
  } else {
    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item" + (task.done ? " done" : "");
      li.setAttribute("data-id", task.id);

      const check = document.createElement("button");
      check.type = "button";
      check.className = "task-check";
      check.setAttribute("aria-label", task.done ? "Mark incomplete" : "Mark complete");
      check.addEventListener("click", () => toggleTask(task.id));

      const priorityDot = document.createElement("span");
      priorityDot.className = "task-priority-dot task-priority-dot--" + (task.priority || "green");
      priorityDot.setAttribute("title", task.priority === "red" ? "High" : task.priority === "yellow" ? "Medium" : "Low");

      const textWrap = document.createElement("div");
      textWrap.className = "task-text-wrap";
      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.text;
      textWrap.appendChild(span);
      const meta = document.createElement("div");
      meta.className = "task-meta";
      const tagLabel = document.createElement("span");
      tagLabel.className = "task-tag task-tag--" + (task.tag || "Misc").toLowerCase();
      tagLabel.textContent = task.tag || "Misc";
      meta.appendChild(tagLabel);
      if (task.dueDate) {
        const due = document.createElement("span");
        due.className = "task-due";
        due.textContent = formatDueDate(task.dueDate);
        meta.appendChild(due);
      }
      textWrap.appendChild(meta);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "task-delete";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });

      li.appendChild(check);
      li.appendChild(priorityDot);
      li.appendChild(textWrap);
      li.appendChild(del);
      taskList.appendChild(li);
    });
  }

  taskCount.textContent =
    activeCount === 1 ? "1 item" : `${activeCount} items`;
  clearCompletedBtn.style.visibility =
    tasks.some((t) => t.done) ? "visible" : "hidden";
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  taskInput.value = "";
  openDatePicker(text);
});

document.getElementById("dueDateInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("dateModalConfirm").click();
  }
  if (e.key === "Escape") {
    document.getElementById("dateModalSkip").click();
  }
});

function getSelectedTag() {
  const btn = document.querySelector(".tag-btn.active");
  return btn ? btn.dataset.tag : "Misc";
}

function getSelectedPriority() {
  const dot = document.querySelector(".priority-dot.active");
  return dot ? dot.dataset.priority : "green";
}

document.querySelectorAll(".tag-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tag-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.querySelectorAll(".priority-dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    document.querySelectorAll(".priority-dot").forEach((d) => d.classList.remove("active"));
    dot.classList.add("active");
  });
});

document.getElementById("dateModalConfirm").addEventListener("click", () => {
  const text = window._pendingTaskText;
  const dateValue = document.getElementById("dueDateInput").value;
  if (text) addTask(text, dateValue || null, getSelectedTag(), getSelectedPriority());
  closeDatePicker();
});

document.getElementById("dateModalSkip").addEventListener("click", () => {
  const text = window._pendingTaskText;
  if (text) addTask(text, null, getSelectedTag(), getSelectedPriority());
  closeDatePicker();
});

document.getElementById("dateModalBackdrop").addEventListener("click", () => {
  const text = window._pendingTaskText;
  if (text) addTask(text, null, getSelectedTag(), getSelectedPriority());
  closeDatePicker();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

/* Settings */
const settingsModal = document.getElementById("settingsModal");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModalBackdrop = document.getElementById("settingsModalBackdrop");
const blockedSitesInput = document.getElementById("blockedSitesInput");
const settingsModalSave = document.getElementById("settingsModalSave");
const themeBtns = document.querySelectorAll(".theme-btn");

function openSettings() {
  const s = loadSettings();
  blockedSitesInput.value = (s.blockedSites || []).join("\n");
  themeBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === (s.theme || "light"));
  });
  settingsModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeSettings() {
  settingsModal.hidden = true;
  document.body.style.overflow = "";
}

settingsBtn.addEventListener("click", openSettings);
settingsModalBackdrop.addEventListener("click", closeSettings);

settingsModalSave.addEventListener("click", () => {
  const lines = blockedSitesInput.value
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
  const activeThemeBtn = document.querySelector(".theme-btn.active");
  const theme = activeThemeBtn ? activeThemeBtn.dataset.theme : "light";
  const settings = { blockedSites: lines, theme };
  saveSettings(settings);
  applyTheme(theme);
  closeSettings();
});

themeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    themeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

applyTheme(loadSettings().theme);
render();
