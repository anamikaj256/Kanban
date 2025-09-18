Kanban Board — Refactor (render / storage / dragdrop)
Why I split the code this way
I broke the code into three modules so each part has a clear job:
•	storage.js → manages the task list and saves it to localStorage. It’s the “single source of truth.”
•	render.js → handles everything about the UI. It creates and updates DOM elements without touching the data.
•	dragdrop.js → only deals with drag-and-drop events. Keeping it separate makes it easy to change or extend later (like adding keyboard support).
This separation makes the code easier to maintain, test, and extend with new features.
Smarter rendering (no full refresh)
Instead of clearing the whole board and re-rendering every time, render.js is smart:
1.	It sorts tasks in each column by priority (High → Medium → Low) and then by creation time.
2.	It reuses existing DOM nodes if they already exist, just updating what changed.
3.	It moves tasks only if their position or column changed.
4.	It only creates or deletes nodes when necessary.
This keeps the app fast, avoids flickering, and makes drag-and-drop feel smoother.
Bugs I fixed
•	Task IDs: Now using crypto.randomUUID() (or a fallback) so IDs are always unique. No more collisions when adding tasks quickly.
•	Delete issue: Instead of filtering (which sometimes removed the wrong task), deletion now finds the exact task and removes it safely.
•	Drag-and-drop reliability: Drops are validated so the app won’t lose tasks or crash when an invalid ID is passed.
What I’d build next
I’d add due dates with reminders:
•	When creating a task, users could set a deadline.
•	Tasks would show their due date, and sorting could take it into account.
•	A small background checker could send notifications for tasks that are overdue or due soon.
This would make the board more than just task tracking — it would help users stay on top of deadlines too.

