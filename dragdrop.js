
export function attachDragHandlers(el, task) {
  // ensure element has dataset.id
  if (!el) return;
  el.dataset.id = task.id;

  el.addEventListener('dragstart', (e) => {
    el.classList.add('dragging');
    try {
      // store the id as plain text
      e.dataTransfer.setData('text/plain', String(task.id));
      // hint
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.error('dragstart: failed to set dataTransfer', err);
    }
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
  });
}


export function initDropzones(zoneElements, onDrop) {
  const zones = Array.from(zoneElements || []);
  zones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const zoneId = zone.id;
      if (!id) {
        console.warn('Dropped item missing id');
        return;
      }
      try {
        const ok = onDrop && onDrop(id, zoneId);
        if (!ok) {
          console.warn('Drop handler did not update task. ID:', id);
        }
      } catch (err) {
        console.error('Error handling drop for id', id, err);
      }
    });
  });
}
