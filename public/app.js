const initialTasks = [
  { name: "Design the onboarding flow", tag: "Design", time: "45 min", done: false },
  { name: "Review Q4 marketing goals", tag: "Work", time: "30 min", done: false },
  { name: "Reply to client emails", tag: "Admin", time: "20 min", done: true },
  { name: "Read 10 pages of Atomic Habits", tag: "Personal", time: "15 min", done: false },
];

let tasks = JSON.parse(localStorage.getItem("focusflow-tasks") || "null") || initialTasks;
let sessions = readSessions();
let seconds = 25 * 60;
let timer = null;

const taskList = document.querySelector("#taskList");
const timerDisplay = document.querySelector("#timerDisplay");
const timerButton = document.querySelector("#timerButton");
const toast = document.querySelector("#toast");
const activityBars = document.querySelector("#activityBars");
const totalFocus = document.querySelector("#totalFocus");
const focusTrend = document.querySelector("#focusTrend");

function readSessions() {
  try {
    const saved = JSON.parse(localStorage.getItem("focusflow-sessions") || "[]");
    return Array.isArray(saved) ? saved.filter((session) => (
      session
      && Number.isFinite(session.durationMinutes)
      && session.durationMinutes > 0
      && !Number.isNaN(Date.parse(session.completedAt))
    )) : [];
  } catch (error) {
    console.warn("Unable to read saved focus sessions.", error);
    return [];
  }
}

function renderTasks() {
  taskList.innerHTML = tasks.map((task, index) => `
    <div class="task ${task.done ? "done" : ""}" data-index="${index}">
      <button class="check" type="button" aria-label="${task.done ? "Mark incomplete" : "Mark complete"}" aria-pressed="${task.done}">${task.done ? "✓" : ""}</button>
      <span class="task-name">${escapeHtml(task.name)}</span>
      <span class="task-meta"><span class="tag ${task.tag === "Admin" ? "orange" : ""}">${escapeHtml(task.tag)}</span><span class="task-time">${escapeHtml(task.time)}</span></span>
      <span class="task-actions">
        <button class="task-action edit-task" type="button" aria-label="Edit ${escapeHtml(task.name)}">Edit</button>
        <button class="task-action delete-task" type="button" aria-label="Delete ${escapeHtml(task.name)}">Delete</button>
      </span>
    </div>
  `).join("");
  const complete = tasks.filter((task) => task.done).length;
  const percentage = tasks.length ? Math.round((complete / tasks.length) * 100) : 0;
  document.querySelector("#progressText").textContent = `${percentage}%`;
  document.querySelector("#progressBar").style.width = `${percentage}%`;
  document.querySelector("#progressDetail").textContent = `${complete} of ${tasks.length} tasks completed`;
  document.querySelector(".nav-link b").textContent = tasks.filter((task) => !task.done).length;
  localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateTimer() {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${remainder}`;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

function renderActivity() {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - offset));
    return date;
  });
  const dailyMinutes = days.map((day) => sessions
    .filter((session) => {
      const completedAt = new Date(session.completedAt);
      return completedAt.getFullYear() === day.getFullYear()
        && completedAt.getMonth() === day.getMonth()
        && completedAt.getDate() === day.getDate();
    })
    .reduce((total, session) => total + session.durationMinutes, 0));
  const maxMinutes = Math.max(60, ...dailyMinutes);
  activityBars.innerHTML = days.map((day, index) => {
    const height = dailyMinutes[index] ? Math.max(4, (dailyMinutes[index] / maxMinutes) * 100) : 0;
    const label = day.toLocaleDateString(undefined, { weekday: "short" });
    const current = index === days.length - 1 ? " current" : "";
    return `<div class="${current.trim()}" aria-label="${label}: ${formatDuration(dailyMinutes[index])}"><i style="height:${height}%"></i><small>${label}</small></div>`;
  }).join("");
  const firstDay = days[0];
  const weeklySessions = sessions
    .filter((session) => new Date(session.completedAt) >= firstDay);
  const totalMinutes = weeklySessions
    .reduce((total, session) => total + session.durationMinutes, 0);
  totalFocus.textContent = formatDuration(totalMinutes);
  focusTrend.textContent = totalMinutes ? `${weeklySessions.length} completed session${weeklySessions.length === 1 ? "" : "s"}` : "No completed sessions yet";
}

function completeFocusSession() {
  sessions.push({ completedAt: new Date().toISOString(), durationMinutes: 25 });
  localStorage.setItem("focusflow-sessions", JSON.stringify(sessions));
  renderActivity();
}

taskList.addEventListener("click", (event) => {
  const task = event.target.closest(".task");
  if (!task) return;
  const index = Number(task.dataset.index);
  if (event.target.closest(".edit-task")) {
    editTask(index);
    return;
  }
  if (event.target.closest(".delete-task")) {
    deleteTask(index);
    return;
  }
  if (!event.target.closest(".check")) return;
  tasks[index].done = !tasks[index].done;
  renderTasks();
  showToast(tasks[index].done ? "Task completed ✓" : "Task marked incomplete");
});

function editTask(index) {
  const name = window.prompt("Update the task name", tasks[index].name);
  if (name === null) return;
  const trimmedName = name.trim();
  if (!trimmedName) {
    showToast("Task name cannot be empty");
    return;
  }
  tasks[index].name = trimmedName;
  renderTasks();
  showToast("Task updated");
}

function deleteTask(index) {
  const taskName = tasks[index].name;
  if (!window.confirm(`Delete "${taskName}"?`)) return;
  tasks.splice(index, 1);
  renderTasks();
  showToast("Task deleted");
}

function addTask() {
  const name = window.prompt("What do you want to focus on?");
  if (!name || !name.trim()) return;
  tasks.unshift({ name: name.trim(), tag: "New", time: "25 min", done: false });
  renderTasks();
  showToast("Task added");
}

document.querySelector("#newTaskButton").addEventListener("click", addTask);
document.querySelector("#addTaskRow").addEventListener("click", addTask);
document.querySelector("#resetTimer").addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  seconds = 25 * 60;
  timerButton.innerHTML = "▶ Start focus";
  document.querySelector("#timerStatus").textContent = "Ready to focus";
  updateTimer();
});
document.querySelector("#skipTimer").addEventListener("click", () => {
  seconds = 0;
  updateTimer();
  clearInterval(timer);
  timer = null;
  timerButton.innerHTML = "▶ Start focus";
  document.querySelector("#timerStatus").textContent = "Session complete";
  showToast("Focus session complete 🎉");
});
timerButton.addEventListener("click", () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    timerButton.innerHTML = "▶ Resume focus";
    document.querySelector("#timerStatus").textContent = "Paused";
    return;
  }
  timerButton.innerHTML = "Ⅱ Pause focus";
  document.querySelector("#timerStatus").textContent = "In the zone";
  timer = setInterval(() => {
    seconds -= 1;
    updateTimer();
    if (seconds <= 0) {
      clearInterval(timer);
      timer = null;
      timerButton.innerHTML = "▶ Start focus";
      document.querySelector("#timerStatus").textContent = "Session complete";
      completeFocusSession();
      showToast("Focus session complete 🎉");
    }
  }, 1000);
});

renderTasks();
updateTimer();
renderActivity();
