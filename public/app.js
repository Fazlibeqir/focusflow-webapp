const initialTasks = [
  { name: "Design the onboarding flow", tag: "Design", time: "45 min", done: false },
  { name: "Review Q4 marketing goals", tag: "Work", time: "30 min", done: false },
  { name: "Reply to client emails", tag: "Admin", time: "20 min", done: true },
  { name: "Read 10 pages of Atomic Habits", tag: "Personal", time: "15 min", done: false },
];

let tasks = JSON.parse(localStorage.getItem("focusflow-tasks") || "null") || initialTasks;
let seconds = 25 * 60;
let timer = null;

const taskList = document.querySelector("#taskList");
const timerDisplay = document.querySelector("#timerDisplay");
const timerButton = document.querySelector("#timerButton");
const toast = document.querySelector("#toast");

function renderTasks() {
  taskList.innerHTML = tasks.map((task, index) => `
    <div class="task ${task.done ? "done" : ""}" data-index="${index}">
      <button class="check" type="button" aria-label="${task.done ? "Mark incomplete" : "Mark complete"}" aria-pressed="${task.done}">${task.done ? "✓" : ""}</button>
      <span class="task-name">${task.name}</span>
      <span class="task-meta"><span class="tag ${task.tag === "Admin" ? "orange" : ""}">${task.tag}</span><span class="task-time">${task.time}</span></span>
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

taskList.addEventListener("click", (event) => {
  const task = event.target.closest(".task");
  if (!task) return;
  const index = Number(task.dataset.index);
  tasks[index].done = !tasks[index].done;
  renderTasks();
  showToast(tasks[index].done ? "Task completed ✓" : "Task marked incomplete");
});

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
      showToast("Focus session complete 🎉");
    }
  }, 1000);
});

renderTasks();
updateTimer();
