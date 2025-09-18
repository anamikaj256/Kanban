
const priorityOrder = { High: 0, Medium: 1, Low: 2 };

let containers = null; // { todoEl, inprogressEl, doneEl }
let callbacks = null;  // { onDelete, attachDragHandlers }

const nodeMap = new Map(); // id -> DOM element

export function initRender(containerElements = {}, cb = {}) {
  containers = {
    todoEl: containerElements.todoEl,
    inprogressEl: containerElements.inprogressEl,
    doneEl: containerElements.doneEl
  };
  callbacks = {
    onDelete: cb.onDelete || (() => {}),
    attachDragHandlers: cb.attachDragHandlers || (() => {})
  };
}

/** Return a fresh task element for a task */
function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = 'task';
  div.draggable = true;
  div.dataset.id = task.id;
  div.dataset.priority = task.priority;
  div.dataset.status = task.status;

  // left side: title + priority badge
  const left = document.createElement('div');
  left.className = 'left';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'task-title';
  titleSpan.textContent = task.title;

  const badge = document.createElement('span');
  badge.className = `priority-badge priority-${task.priority}`;
  badge.textContent = task.priority;

  left.appendChild(titleSpan);
  left.appendChild(badge);

  // right side: controls
  const right = document.createElement('div');
  right.className = 'right';

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.title = 'Delete task';
  delBtn.textContent = 'x';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    callbacks.onDelete && callbacks.onDelete(task.id);
  });

  right.appendChild(delBtn);

  div.appendChild(left);
  div.appendChild(right);

  // attach drag handlers through callback (so dragdrop module can hook)
  callbacks.attachDragHandlers && callbacks.attachDragHandlers(div, task);

  return div;
}

/** Update DOM element content if changed */
function updateTaskElement(el, task) {
  if (!el) return;
  // title
  const titleSpan = el.querySelector('.task-title');
  if (titleSpan && titleSpan.textContent !== task.title) {
    titleSpan.textContent = task.title;
  }
  // priority badge
  const badge = el.querySelector('.priority-badge');
  if (badge) {
    if (badge.textContent !== task.priority) {
      badge.textContent = task.priority;
      badge.className = `priority-badge priority-${task.priority}`;
    }
  }
  // data attributes
  if (el.dataset.status !== task.status) el.dataset.status = task.status;
  if (el.dataset.priority !== task.priority) el.dataset.priority = task.priority;
}

/** Sort function by priority then createdAt */
function sortTasks(a, b) {
  const pa = priorityOrder[a.priority] ?? 999;
  const pb = priorityOrder[b.priority] ?? 999;
  if (pa !== pb) return pa - pb;
  return a.createdAt - b.createdAt;
}

/** Main render function */
export function renderBoard(tasks = []) {
  if (!containers) {
    console.warn('renderBoard called before initRender');
    return;
  }

  // build lookup set of incoming task ids
  const incomingIds = new Set(tasks.map(t => t.id));

  // remove DOM nodes that are no longer present
  for (const existingId of Array.from(nodeMap.keys())) {
    if (!incomingIds.has(existingId)) {
      const node = nodeMap.get(existingId);
      if (node && node.parentNode) node.parentNode.removeChild(node);
      nodeMap.delete(existingId);
    }
  }

  // group tasks by status and sort
  const byStatus = {
    todo: tasks.filter(t => t.status === 'todo').sort(sortTasks),
    inprogress: tasks.filter(t => t.status === 'inprogress').sort(sortTasks),
    done: tasks.filter(t => t.status === 'done').sort(sortTasks)
  };

  // helper to reconcile a column
  function reconcileColumn(containerEl, desiredTasks) {
    // iterate desiredTasks in order and ensure DOM nodes exist and are in that order
    for (let i = 0; i < desiredTasks.length; i++) {
      const task = desiredTasks[i];
      let node = nodeMap.get(task.id);
      if (!node) {
        node = createTaskElement(task);
        nodeMap.set(task.id, node);
      } else {
        // update content if needed
        updateTaskElement(node, task);
      }

      // ensure node is a child of containerEl and in correct position
      const existingAtI = containerEl.children[i];
      if (existingAtI === node) {
        // already at right spot
        continue;
      } else {
        // insert before the current child at position i, or append if none
        if (existingAtI) {
          containerEl.insertBefore(node, existingAtI);
        } else {
          containerEl.appendChild(node);
        }
      }
    }
    
  }

  reconcileColumn(containers.todoEl, byStatus.todo);
  reconcileColumn(containers.inprogressEl, byStatus.inprogress);
  reconcileColumn(containers.doneEl, byStatus.done);
}
