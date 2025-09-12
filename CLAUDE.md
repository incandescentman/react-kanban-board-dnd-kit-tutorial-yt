# Project Documentation

- [[file:README.org][README.org]] - Main project documentation and features list
- [[file:change-log.org][change-log.org]] - Detailed changelog of updates and improvements

# Immediate: Change storage format
Below is one practical way to *round-trip* the outline back into JSON **while keeping the intermediate heading (“July items”) visible in the data model**.

---

## 1 · A minimal nested schema

#+begin_src ts
interface Board {
  title: string
  columns: Column[]
}

interface Column {
  id: string | number          // “todo”, 7746, etc.
  title: string                // “To Do”, “Ideas” …
  groups: Group[]              // zero or more nested headings
  tasks : Task[]               // tasks that sit directly under the column
}

interface Group {
  id: string                   // slug of heading text, or a UUID
  title: string                // “July items”
  tasks: Task[]
}

interface Task {
  id      : number
  content : string
  status  : "TODO" | "DONE" | "STARTED" | "NEXT" | string
}
#+end_src 

*Why this shape?*

* **Groups** give you one extra level without forcing every task to nest; tasks can still live directly inside a column.
* You can ignore `groups` when serialising back to the flat format you already use.

---

## 2 · How the sample outline becomes JSON

#+begin_src json
{
  "title": "Sunjay's Post-OpenAI Action Plan",
  "columns": [
    {
      "id": 7746,
      "title": "Ideas",
      "groups": [],
      "tasks": [
        { "id": 9439, "content": "Write job descriptions", "status": "TODO" }
      ]
    },
    {
      "id": "todo",
      "title": "To Do",
      "groups": [
        {
          "id": "july-items",
          "title": "July items",
          "tasks": [
            { "id": 7350, "content": "Pick up laundry", "status": "TODO" },
            { "id": 6263, "content": "Do project",      "status": "TODO" }
          ]
        }
      ],
      "tasks": []
    },
    {
      "id": "doing",
      "title": "In Progress",
      "groups": [],
      "tasks": [
        { "id": 5374, "content": "Write chapter", "status": "STARTED" }
      ]
    },
    {
      "id": "done",
      "title": "Done",
      "groups": [],
      "tasks": [
        { "id": 5056, "content": "Publish blog post", "status": "DONE" }
      ]
    },
    {
      "id": 1337,
      "title": "TASKS TO DO",
      "groups": [],
      "tasks": [
        { "id": 7731, "content": "Finish me off and move me to finished tasks", "status": "TODO" }
      ]
    },
    {
      "id": 4242,
      "title": "COMPLETED TASKS",
      "groups": [],
      "tasks": [
        { "id": 2424, "content": "I have already been done", "status": "DONE" }
      ]
    }
  ]
}
#+end_src 

---

## 3 · Parser outline (Org → JSON)

1. **Walk the outline depth-first** keeping a stack of the current heading levels.
2. When you hit a depth-1 heading (`*`), create a `Column`.
3. At depth-2:

   * If the line begins with a TODO keyword → it’s a **task** directly under the column.
   * Otherwise → treat it as a **group**; push it onto the stack.
4. At depth-3 (or deeper) every TODO line becomes a `Task` whose parent is the *nearest* group (or the column if no group).
5. Extract:

   * **Status** = first keyword (`TODO`, `DONE`, `STARTED` …).
   * **Content** = remaining text before any trailing `::id::`.
   * **id** = number found between the final double-colons; fallback to a UUID if absent.
6. Pop the stack when you leave a heading level.

---

## 4 · Round-tripping back to your existing flat structure

If you ever need to collapse groups again (e.g. to feed an older version of the app):

#+begin_src js
function flatten(board) {
  const flat = { columns: [], tasks: [] };

  for (const col of board.columns) {
    flat.columns.push({ id: col.id, title: col.title });

    for (const t of col.tasks) {
      flat.tasks.push({ ...t, columnId: col.id });
    }

    for (const g of col.groups) {
      for (const t of g.tasks) {
        flat.tasks.push({ ...t, columnId: col.id, group: g.title });
      }
    }
  }
  return flat;
}
#+end_src 

`group` is optional metadata your old UI can ignore safely.

---

### Take-away

* Add a **`groups`** array to each column—nothing else in your backend has to change.
* Parsing Org with a two-level limit (columns → groups → tasks) keeps the serializer simple *and* lets Emacs users insert ad-hoc headings like “July items” without breaking the React UI.

Claude, please store data in localstorage a richer JSON format like the one you showed.

### Short answer

**Yes—moving to a slightly richer schema is worth it** once you introduce sub-headings like “July items.” It keeps the data self-describing, avoids fragile string parsing in React, and lets you round-trip Org-mode ⇄ GUI without hacks.

---

### Why the richer JSON helps

* **One-to-one mapping with Org-mode.**
  Columns → first-level headings, Groups → second-level non-TODO headings, Tasks → TODO items. No inferencing needed.

* **Eliminates ambiguity.**
  A task’s parent is explicit (`columnId` or `groupId`), so renaming “July items” in Emacs doesn’t orphan tasks.

* **Easier UI logic.**
  React components can render `column.groups` directly; no need to filter by string prefixes.

* **Future-proof.**
  If you later add more nestable features (quarters, themes, epics) you can extend the same pattern.

---

### Migration strategy (keep it painless)

1. **Add, don’t break.**

   * Extend every column object with empty `groups: []` and keep `tasks` where they are.
   * Older localStorage snapshots still parse—`groups` just defaults to `[]`.

2. **Detect “group” headings at import time.**
   When parsing Org-mode:

   * If a depth-2 heading has a TODO keyword → push to `column.tasks`.
   * If it lacks a TODO keyword → create a `Group` and tuck subsequent depth-3 TODOs inside.

3. **Flatten on export (if needed).**
   Legacy code (or a different app) can call a `flatten(board)` helper to drop `groupId` and merge tasks back into the old array shape.

4. **Version flag (optional).**
   Add `"schemaVersion": 2` at the root so future changes stay explicit.

---

### Minimal code delta inside React

```ts
// 1. Define types
type Group = { id: string; title: string; tasks: Task[] };
type Column = { id: string|number; title: string; tasks: Task[]; groups: Group[] };

// 2. Update initial state parser
const loadBoard = () => {
  const raw = JSON.parse(localStorage.getItem('kanban-board-state') || '{}');
  return migrateV1toV2(raw);   // adds groups: []
};

// 3. Saving
useEffect(() => {
  localStorage.setItem('kanban-board-state', JSON.stringify(board));
}, [board]);
```

The UI change is mostly in the render function—loop through `column.groups` beneath the main column list.

---

### When it’s **not** worth it

* If headings will *never* go deeper than columns (i.e., “July items” was a one-off);
* or if you prefer a *single flat list* and treat groups as cosmetic labels.

In that case, add a simple `groupTitle` string on each task instead of nesting—quick but less robust.

---

### Recommendation

*Adopt the richer schema now*—it’s a one-time bump in complexity that unlocks clean Org-mode round-tripping and keeps your data model aligned with what you actually see in the outline. Keep a flattening helper around for backward compatibility or exporting to other apps.




# To Do: Functionality we still need to add 
We need to add a way to create hierarchy

headings and todos under the headings

and todos under the todos

any

preceding a text entry with # should turn it into a heading
- should convert to a task
  - should convert to a subtask


We need to be able to deploy it via vercel and for someone else to see all my data. (Other users don't need to change my data, except to add to the notes section.) 

# Functionality we already added

⏺ Here's a complete summary of all the functionality we've built for your kanban board:

##  Core Kanban Features

- Drag & Drop: Move tasks between columns and reorder within columns
- Task Management: Create, edit, delete, and complete tasks
- Column Management: Create new columns, edit column titles
- Persistent Storage: All changes automatically saved to localStorage

##  Task Creation & Editing

- Click to Create: Click anywhere in empty space below tasks to create new task
- Auto-Focus: New tasks automatically enter edit mode for immediate typing
- Smart Saving:
  - Enter key saves task
  - Shift+Enter adds line breaks
  - Blank tasks are automatically deleted
- Cursor Positioning: When editing existing tasks, cursor moves to end of text

##  Task Completion System

- Visual Checkboxes: Each task has a checkbox at the beginning
- Click to Toggle: Click checkbox to mark task as complete/incomplete
- Visual Feedback:
  - Completed tasks show strikethrough text and gray color
  - Checkbox changes from empty to checked with green styling
- Hover Effects: Checkboxes show hover feedback to indicate they're clickable

##  Comprehensive Keyboard Navigation

- Spacebar: Toggle focus on/off (smart priority: last focused → last modified → first task)
- Arrow Keys: Navigate between tasks in all directions
- Ctrl+Arrows: Drag and drop focused task
- X or Cmd+D: Toggle task completion
- Cmd+Z/Ctrl+Z: Undo deleted tasks
- Cmd+Y/Ctrl+Y: Redo deleted tasks
- Tab/Shift+Tab: Standard browser focus navigation
- Smart Text Editing: All shortcuts disabled when editing text to preserve normal typing

##  Visual Design & UX

- Light Theme: Clean white background with light gray columns
- Column Icons: Emoji icons for each column type:
  - 🧠 Ideas
  - 📝 Todo
  - 🏃🏻♂️ In Progress
  - ✅ Done
- Typography:
  - Column headings in Inter Tight font, 3xl size
  - Task count badges show number of tasks per column
- Interactive Elements:
  - Hover effects on tasks, buttons, and checkboxes
  - Trash icon appears on task hover (top-right)
  - Instant tooltips on bottom-right buttons

##  Customization & Persistence

- Editable Title: Click board title to edit (defaults to "Sunjay's Post-OpenAI Plan")
- State Persistence:
  - All task and column data
  - Board title
  - Legend minimized/expanded state
- Cross-Session: Everything persists across page refreshes and dev server restarts

##  User Interface Features

- Minimizable Help:
  - Full keyboard shortcuts legend (expandable)
  - Minimizes to small "?" button in bottom-right
- Discrete Controls:
  - Small "+" button in bottom-right for adding columns
  - No scrollbars (hidden but still functional)
  - Clean, minimal design without clutter

##  Smart Interactions

- Conflict Prevention: All keyboard shortcuts respect text editing context
- Focus Management: Visual focus indicators with blue borders
- Event Handling: Proper click event management to prevent unintended actions
- Responsive Layout: Columns use 90% viewport height for maximum screen usage

##  Accessibility & Polish

- Visual Feedback: Clear hover states and transitions
- Keyboard Accessible: Full functionality available via keyboard
- Intuitive Controls: Standard patterns (checkboxes, arrow navigation, etc.)
- Error Prevention: Empty tasks auto-delete, focus management prevents conflicts

This creates a fully-featured, keyboard-accessible kanban board with modern UX patterns, persistent state, and comprehensive task management capabilities!

================================================================================== Previous Conversation Compacted ==================================================================================
⏺ Compact summary (ctrl+r to expand)
⎿  Read src/components/KanbanBoard.tsx (791 lines)
⎿  Read src/components/TaskCard.tsx (161 lines)
⎿  Read src/icons/TrashIcon.tsx (20 lines)
⎿  Read src/icons/SquareCheckIcon.tsx (20 lines)
⎿  Read src/components/ColumnContainer.tsx (189 lines)
⎿  Todo list read (5 items)

Looking at the current state, everything appears to be working correctly:

- State persistence across refresh and dev server restarts ✓
- Light mode theme with white background ✓
- Hidden scrollbars ✓
- Click-to-add task functionality ✓
- Comprehensive keyboard navigation ✓
- Drag and drop with control+arrow keys ✓
- Undo/redo functionality ✓
- Editable title ✓
- Task completion system with checkboxes ✓
- Emoji icons for columns ✓
- Minimizable legend ✓
- Notes section ✓ 
