// --- State Management ---
let tasks = JSON.parse(localStorage.getItem('focus-tasks')) || [];
let currentTheme = localStorage.getItem('focus-theme') || 'light';
let taskToDelete = null;

const quotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Believe you can and you're halfway there.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Don't wish for it, work for it.",
    "Your future is created by what you do today, not tomorrow."
];

// --- DOM Elements ---
const themeToggle = document.getElementById('theme-toggle');
const dateDisplay = document.getElementById('date-display');
const quoteText = document.getElementById('quote-text');
const studyForm = document.getElementById('study-form');
const taskList = document.getElementById('main-task-list');

// Summary ELements
const totalVal = document.getElementById('total-val');
const completedVal = document.getElementById('completed-val');
const pendingVal = document.getElementById('pending-val');
const progBar = document.getElementById('prog-bar');
const progPercent = document.getElementById('prog-percent');

// Overlays
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
const modalOverlay = document.getElementById('modal-overlay');
const confirmDelBtn = document.getElementById('confirm-del');
const cancelDelBtn = document.getElementById('cancel-del');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    updateDate();
    setRandomQuote();
    renderUI();
});

// --- Theme Logic ---
themeToggle.addEventListener('click', () => {
    currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
    applyTheme(currentTheme);
});

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('focus-theme', theme);
    themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// --- Task CRUD Logic ---
studyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = document.getElementById('in-subject').value.trim();
    const topic = document.getElementById('in-topic').value.trim();
    const date = document.getElementById('in-date').value;

    if (!subject || !topic || !date) return;

    const newTask = {
        id: Date.now(),
        subject,
        topic,
        date,
        completed: false
    };

    tasks.push(newTask);
    saveData();
    studyForm.reset();
    showToast("Task created successfully!");
    renderUI();
});

window.toggleComplete = (id) => {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveData();
    renderUI();
};

window.requestDelete = (id) => {
    taskToDelete = id;
    modalOverlay.style.display = 'flex';
    setTimeout(() => modalOverlay.querySelector('.modal').classList.add('open'), 10);
};

cancelDelBtn.addEventListener('click', closeModal);
confirmDelBtn.addEventListener('click', () => {
    if (taskToDelete) {
        tasks = tasks.filter(t => t.id !== taskToDelete);
        saveData();
        closeModal();
        showToast("Task removed.", "danger");
        renderUI();
    }
});

function closeModal() {
    modalOverlay.querySelector('.modal').classList.remove('open');
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        taskToDelete = null;
    }, 300);
}

// --- Helper Functions ---
function saveData() {
    localStorage.setItem('focus-tasks', JSON.stringify(tasks));
}

function renderUI() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 4rem; background: var(--bg-card); border-radius: 16px; border: 2px dashed var(--border);">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>Your roadmap is clear. Create your first milestone to get started.</p>
            </div>
        `;
    }

    tasks.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((t, i) => {
        const card = document.createElement('div');
        card.className = `task-card ${t.completed ? 'done' : ''}`;
        card.style.animationDelay = `${i * 0.05}s`;

        card.innerHTML = `
            <div class="task-main">
                <span class="tag">${t.subject}</span>
                <h3>${t.topic}</h3>
                <div class="task-sub">
                    <span><i class="far fa-calendar-check"></i> ${formatDate(t.date)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon check-btn" onclick="toggleComplete(${t.id})" title="Toggle Complete">
                    <i class="fas ${t.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="btn-icon del-btn" onclick="requestDelete(${t.id})" title="Delete Goal">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        taskList.appendChild(card);
    });

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    totalVal.textContent = total;
    completedVal.textContent = done;
    pendingVal.textContent = pending;

    progBar.style.width = `${percent}%`;
    progPercent.textContent = `${percent}%`;
}

function showToast(msg, type = "success") {
    toastMsg.textContent = msg;
    toast.style.borderLeftColor = type === "success" ? "var(--success)" : "var(--danger)";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
}

function setRandomQuote() {
    quoteText.textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
