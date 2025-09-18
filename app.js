import * as storage from './storage.js';
import * as render from './render.js';
import * as dragdrop from './dragdrop.js';

// DOM references
const form = document.getElementById('taskForm');
const input = document.getElementById('taskTitle');
const prioritySelect = document.getElementById('taskPriority');

const todoZone = document.getElementById('todo');
const inprogressZone = document.getElementById('inprogress');
const doneZone = document.getElementById('done');

// load tasks into memory from localStorage
storage.loadTasks();

// mount render with container refs and callbacks
render.initRender(
  { todoEl: todoZone, inprogressEl: inprogressZone, doneEl: doneZone },
  {
    onDelete: (id) => {
      const ok = storage.deleteTask(id);
      if (!ok) console.warn('Attempted to delete non-existing task id', id);
      refresh();
    },
    attachDragHandlers: (el, task) => {
      dragdrop.attachDragHandlers(el, task);
    }
  }
);

// initialize dropzones
dragdrop.initDropzones([todoZone, inprogressZone, doneZone], (id, zoneId) => {
  
  if (!['todo', 'inprogress', 'done'].includes(zoneId)) {
    console.warn('Unknown drop zone id', zoneId);
    return false;
  }
  const updated = storage.updateTask(id, { status: zoneId });
  if (!updated) {
    console.warn('Drop update: task not found for id', id);
    return false;
  }
  refresh();
  return true;
});

// form add
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value && input.value.trim();
  const pr = prioritySelect.value;
  if (!title) return;
  storage.addTask({ title, priority: pr });
  input.value = '';
  prioritySelect.value = 'Medium';
  refresh();
});

// single refresh/render helper
function refresh() {
  const tasks = storage.getTasks();
  render.renderBoard(tasks);
}

// initial render
refresh();

