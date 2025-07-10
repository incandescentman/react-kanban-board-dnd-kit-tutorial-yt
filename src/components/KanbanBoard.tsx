import PlusIcon from "../icons/PlusIcon";
import { useMemo, useState, useEffect } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const defaultCols: Column[] = [
  {
    id: "todo",
    title: "Todo",
  },
  {
    id: "doing",
    title: "Work in progress",
  },
  {
    id: "done",
    title: "Done",
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    columnId: "todo",
    content: "List admin APIs for dashboard",
  },
  {
    id: "2",
    columnId: "todo",
    content:
      "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
  },
  {
    id: "3",
    columnId: "doing",
    content: "Conduct security testing",
  },
  {
    id: "4",
    columnId: "doing",
    content: "Analyze competitors",
  },
  {
    id: "5",
    columnId: "done",
    content: "Create UI kit documentation",
  },
  {
    id: "6",
    columnId: "done",
    content: "Dev meeting",
  },
  {
    id: "7",
    columnId: "done",
    content: "Deliver dashboard prototype",
  },
  {
    id: "8",
    columnId: "todo",
    content: "Optimize application performance",
  },
  {
    id: "9",
    columnId: "todo",
    content: "Implement data validation",
  },
  {
    id: "10",
    columnId: "todo",
    content: "Design database schema",
  },
  {
    id: "11",
    columnId: "todo",
    content: "Integrate SSL web certificates into workflow",
  },
  {
    id: "12",
    columnId: "doing",
    content: "Implement error logging and monitoring",
  },
  {
    id: "13",
    columnId: "doing",
    content: "Design and implement responsive UI",
  },
];

const STORAGE_KEY = 'kanban-board-state';

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.columns || defaultCols;
    }
    return defaultCols;
  });
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.tasks || defaultTasks;
    }
    return defaultTasks;
  });

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [redoTask, setRedoTask] = useState<Task | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<Id | null>(null);
  const [lastModifiedTaskId, setLastModifiedTaskId] = useState<Id | null>(null);
  const [legendMinimized, setLegendMinimized] = useState(() => {
    const stored = localStorage.getItem('kanban-legend-minimized');
    return stored ? JSON.parse(stored) : false;
  });
  const [boardTitle, setBoardTitle] = useState(() => {
    const stored = localStorage.getItem('kanban-board-title');
    return stored || "Sunjay's Post-OpenAI Plan";
  });
  const [titleEditMode, setTitleEditMode] = useState(false);
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('kanban-notes');
    return stored || '';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ columns, tasks }));
  }, [columns, tasks]);

  useEffect(() => {
    localStorage.setItem('kanban-legend-minimized', JSON.stringify(legendMinimized));
  }, [legendMinimized]);

  useEffect(() => {
    localStorage.setItem('kanban-board-title', boardTitle);
  }, [boardTitle]);

  useEffect(() => {
    localStorage.setItem('kanban-notes', notes);
  }, [notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && deletedTask) {
        e.preventDefault();
        setTasks(prev => [...prev, deletedTask]);
        setRedoTask(deletedTask);
        setDeletedTask(null);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'y' && redoTask) {
        e.preventDefault();
        const taskToRedo = redoTask;
        setDeletedTask(taskToRedo);
        setRedoTask(null);
        const newTasks = tasks.filter(task => task.id !== taskToRedo.id);
        setTasks(newTasks);
        return;
      }

      if (e.altKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Don't interfere with alt+arrow keys when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        handleKeyboardNavigation(e.key);
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Don't interfere with arrow keys when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        handleKeyboardNavigation(e.key);
      }

      if (e.key === ' ' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // Don't interfere with spacebar when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        toggleKeyboardFocus();
      }

      if (e.ctrlKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Don't interfere with ctrl+arrow keys when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        handleKeyboardDragDrop(e.key);
      }

      if ((e.key === 'x' || (e.metaKey && e.key === 'd')) && !e.altKey && !e.ctrlKey) {
        // Don't interfere when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        // Toggle completion if a task has focus
        if (focusedTaskId) {
          e.preventDefault();
          e.stopPropagation();
          toggleTaskComplete(focusedTaskId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedTask, redoTask, focusedTaskId, lastModifiedTaskId, tasks, columns]);

  const handleKeyboardNavigation = (key: string) => {
    if (tasks.length === 0) return;

    // If no task is focused, focus the first task
    if (!focusedTaskId) {
      const firstTask = tasks[0];
      if (firstTask) {
        setFocusedTaskId(firstTask.id);
        focusTask(firstTask.id);
      }
      return;
    }

    const currentTask = tasks.find(task => task.id === focusedTaskId);
    if (!currentTask) return;

    const currentColumn = columns.find(col => col.id === currentTask.columnId);
    if (!currentColumn) return;

    const tasksInCurrentColumn = tasks.filter(task => task.columnId === currentColumn.id);
    const currentTaskIndex = tasksInCurrentColumn.findIndex(task => task.id === focusedTaskId);

    switch (key) {
      case 'ArrowUp':
        if (currentTaskIndex > 0) {
          const prevTask = tasksInCurrentColumn[currentTaskIndex - 1];
          setFocusedTaskId(prevTask.id);
          focusTask(prevTask.id);
        }
        break;
      
      case 'ArrowDown':
        if (currentTaskIndex < tasksInCurrentColumn.length - 1) {
          const nextTask = tasksInCurrentColumn[currentTaskIndex + 1];
          setFocusedTaskId(nextTask.id);
          focusTask(nextTask.id);
        }
        break;
      
      case 'ArrowLeft':
        const currentColumnIndex = columns.findIndex(col => col.id === currentColumn.id);
        if (currentColumnIndex > 0) {
          const prevColumn = columns[currentColumnIndex - 1];
          const tasksInPrevColumn = tasks.filter(task => task.columnId === prevColumn.id);
          if (tasksInPrevColumn.length > 0) {
            const targetTask = tasksInPrevColumn[Math.min(currentTaskIndex, tasksInPrevColumn.length - 1)];
            setFocusedTaskId(targetTask.id);
            focusTask(targetTask.id);
          }
        }
        break;
      
      case 'ArrowRight':
        const currentColIndex = columns.findIndex(col => col.id === currentColumn.id);
        if (currentColIndex < columns.length - 1) {
          const nextColumn = columns[currentColIndex + 1];
          const tasksInNextColumn = tasks.filter(task => task.columnId === nextColumn.id);
          if (tasksInNextColumn.length > 0) {
            const targetTask = tasksInNextColumn[Math.min(currentTaskIndex, tasksInNextColumn.length - 1)];
            setFocusedTaskId(targetTask.id);
            focusTask(targetTask.id);
          }
        }
        break;
    }
  };

  const focusTask = (taskId: Id) => {
    const element = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  const toggleKeyboardFocus = () => {
    if (tasks.length === 0) return;

    // If a task is currently focused, remove focus
    if (focusedTaskId && tasks.find(task => task.id === focusedTaskId)) {
      setFocusedTaskId(null);
      // Remove focus from the currently focused element
      const focusedElement = document.activeElement as HTMLElement;
      if (focusedElement && focusedElement.blur) {
        focusedElement.blur();
      }
      return;
    }

    // Otherwise, initiate focus using priority system
    initiateKeyboardFocus();
  };

  const initiateKeyboardFocus = () => {
    if (tasks.length === 0) return;

    // Priority 1: Use the most recently focused task if it still exists
    if (focusedTaskId && tasks.find(task => task.id === focusedTaskId)) {
      focusTask(focusedTaskId);
      return;
    }

    // Priority 2: Use the most recently modified task if it exists
    if (lastModifiedTaskId && tasks.find(task => task.id === lastModifiedTaskId)) {
      setFocusedTaskId(lastModifiedTaskId);
      focusTask(lastModifiedTaskId);
      return;
    }

    // Priority 3: Focus the first task as fallback
    const firstTask = tasks[0];
    if (firstTask) {
      setFocusedTaskId(firstTask.id);
      focusTask(firstTask.id);
    }
  };

  const handleKeyboardDragDrop = (key: string) => {
    if (!focusedTaskId || tasks.length === 0) return;

    const currentTask = tasks.find(task => task.id === focusedTaskId);
    if (!currentTask) return;

    const currentColumn = columns.find(col => col.id === currentTask.columnId);
    if (!currentColumn) return;

    const tasksInCurrentColumn = tasks.filter(task => task.columnId === currentColumn.id);
    const currentTaskIndex = tasksInCurrentColumn.findIndex(task => task.id === focusedTaskId);

    switch (key) {
      case 'ArrowUp':
        if (currentTaskIndex > 0) {
          // Move task up within the same column
          const newTasks = [...tasks];
          const taskIndex = newTasks.findIndex(task => task.id === focusedTaskId);
          const targetTaskIndex = newTasks.findIndex(task => task.id === tasksInCurrentColumn[currentTaskIndex - 1].id);
          
          [newTasks[taskIndex], newTasks[targetTaskIndex]] = [newTasks[targetTaskIndex], newTasks[taskIndex]];
          setTasks(newTasks);
        }
        break;
      
      case 'ArrowDown':
        if (currentTaskIndex < tasksInCurrentColumn.length - 1) {
          // Move task down within the same column
          const newTasks = [...tasks];
          const taskIndex = newTasks.findIndex(task => task.id === focusedTaskId);
          const targetTaskIndex = newTasks.findIndex(task => task.id === tasksInCurrentColumn[currentTaskIndex + 1].id);
          
          [newTasks[taskIndex], newTasks[targetTaskIndex]] = [newTasks[targetTaskIndex], newTasks[taskIndex]];
          setTasks(newTasks);
        }
        break;
      
      case 'ArrowLeft':
        const currentColumnIndex = columns.findIndex(col => col.id === currentColumn.id);
        if (currentColumnIndex > 0) {
          // Move task to the previous column
          const prevColumn = columns[currentColumnIndex - 1];
          const newTasks = tasks.map(task => {
            if (task.id === focusedTaskId) {
              return { ...task, columnId: prevColumn.id };
            }
            return task;
          });
          setTasks(newTasks);
          // Re-focus the task after moving to a new column
          setTimeout(() => focusTask(focusedTaskId), 0);
        }
        break;
      
      case 'ArrowRight':
        const currentColIndex = columns.findIndex(col => col.id === currentColumn.id);
        if (currentColIndex < columns.length - 1) {
          // Move task to the next column
          const nextColumn = columns[currentColIndex + 1];
          const newTasks = tasks.map(task => {
            if (task.id === focusedTaskId) {
              return { ...task, columnId: nextColumn.id };
            }
            return task;
          });
          setTasks(newTasks);
          // Re-focus the task after moving to a new column
          setTimeout(() => focusTask(focusedTaskId), 0);
        }
        break;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <div
      className="
        m-auto
        flex
        flex-col
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
        py-8
    "
    >
      {!titleEditMode ? (
        <h1 
          className="text-4xl font-bold text-black mb-12 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => setTitleEditMode(true)}
          title="Click to edit title"
        >
          {boardTitle}
        </h1>
      ) : (
        <input
          className="text-4xl font-bold text-black mb-12 bg-transparent border-b-2 border-blue-500 outline-none text-center"
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          onBlur={() => setTitleEditMode(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setTitleEditMode(false);
            }
          }}
          autoFocus
        />
      )}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  toggleTaskComplete={toggleTaskComplete}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  focusedTaskId={focusedTaskId}
                  setFocusedTaskId={setFocusedTaskId}
                />
              ))}
            </SortableContext>
          </div>
          
          {/* Keyboard Navigation Legend */}
          {!legendMinimized && (
            <div className="ml-8 p-6 bg-gray-50 border border-gray-200 rounded-lg min-w-[300px] max-w-[350px] self-start">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Keyboard Navigation</h3>
                <button
                  onClick={() => setLegendMinimized(true)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-mono bg-gray-200 px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Tab/Shift+Tab</span>
                  <span className="ml-2">Focus navigation</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Spacebar</span>
                  <span className="ml-2">Toggle task focus</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Arrow Keys</span>
                  <span className="ml-2">Navigate between tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Ctrl+Arrows</span>
                  <span className="ml-2">Drag and drop task</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Cmd+Z/Ctrl+Z</span>
                  <span className="ml-2">Undo deleted tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Cmd+Y/Ctrl+Y</span>
                  <span className="ml-2">Redo deleted tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Enter</span>
                  <span className="ml-2">Save task when editing</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">Shift+Enter</span>
                  <span className="ml-2">Add line break</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">X or Cmd+D</span>
                  <span className="ml-2">Toggle task done</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-8 mx-auto w-full max-w-[76.5%] px-8">
          <h2 className="text-2xl font-bold text-black mb-4" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
            Advice / Notes / Comments
          </h2>
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-white text-black focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Add your notes, advice, or comments here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                toggleTaskComplete={toggleTaskComplete}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                focusedTaskId={focusedTaskId}
                setFocusedTaskId={setFocusedTaskId}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                toggleTaskComplete={toggleTaskComplete}
                focusedTaskId={focusedTaskId}
                setFocusedTaskId={setFocusedTaskId}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      
      {/* Bottom Right Corner Icons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-10">
        {/* Add Column Button */}
        <div className="relative group">
          <button
            onClick={() => createNewColumn()}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-lg"
          >
            +
          </button>
          <div className="absolute bottom-12 right-0 bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded border border-gray-300 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none whitespace-nowrap">
            Add Column
          </div>
        </div>
        
        {/* Minimized Legend */}
        {legendMinimized && (
          <div className="relative group">
            <button
              onClick={() => setLegendMinimized(false)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-lg"
            >
              ?
            </button>
            <div className="absolute bottom-12 right-0 bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded border border-gray-300 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none whitespace-nowrap">
              Show Keyboard Shortcuts
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: "",
    };

    setTasks([...tasks, newTask]);
    setLastModifiedTaskId(newTask.id);
  }

  function deleteTask(id: Id) {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete) {
      setDeletedTask(taskToDelete);
      setRedoTask(null); // Clear redo when a new deletion happens
    }
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
    setLastModifiedTaskId(id);
  }

  function toggleTaskComplete(id: Id) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, completed: !task.completed };
    });

    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
