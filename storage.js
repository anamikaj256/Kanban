const STORAGE_KEY = 'tasks_v1';

let tasks = [];

/** ID generator: crypto.randomUUID fallback */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse tasks from localStorage:', err);
    tasks = [];
  }
  return tasks.slice(); // return copy
}

export function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

/** Returns a shallow copy */
export function getTasks() {
  return tasks.slice();
}

/** Adds a new task. args: { title, priority } */
export function addTask({ title, priority = 'Medium' } = {}) {
  const t = {
    id: generateId(),
    title: String(title || '').trim(),
    status: 'todo',
    priority: priority || 'Medium',
    createdAt: Date.now()
  };
  tasks.push(t);
  saveTasks();
  return t;
}

/** Updates the first matching task by id, returns updated task or null */
export function updateTask(id, updates = {}) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasks();
  return tasks[idx];
}

/** Deletes the first matching task by id. Returns true if removed. */
export function deleteTask(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  saveTasks();
  return true;
}

/** Utility to replace the whole list (useful for tests) */
export function setTasks(newTasks = []) {
  tasks = Array.isArray(newTasks) ? newTasks.slice() : [];
  saveTasks();
}
