import PlusIcon from "../icons/PlusIcon";
import { useMemo, useState, useEffect } from "react";
import { Board, Column, Id, Task } from "../types";
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

const defaultBoard: Board = {
  title: "Rising Action Board",
  columns: [
    {
      id: "intentions",
      title: "Current Intentions",
      groups: [],
      tasks: [
        {
          id: "int1",
          content: "Track calories daily",
          status: "HABIT",
        },
        {
          id: "int2",
          content: "In bed by midnight",
          status: "HABIT",
        },
        {
          id: "int3",
          content: "Gym every day",
          status: "HABIT",
        },
        {
          id: "int4",
          content: "Read for 30 minutes",
          status: "HABIT",
        },
      ],
    },
    {
      id: "todo",
      title: "Todo",
      groups: [],
      tasks: [
        {
          id: "1",
          content: "List admin APIs for dashboard",
          status: "TODO",
        },
        {
          id: "2",
          content: "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
          status: "TODO",
        },
        {
          id: "8",
          content: "Optimize application performance",
          status: "TODO",
        },
        {
          id: "9",
          content: "Implement data validation",
          status: "TODO",
        },
        {
          id: "10",
          content: "Design database schema",
          status: "TODO",
        },
        {
          id: "11",
          content: "Integrate SSL web certificates into workflow",
          status: "TODO",
        },
      ],
    },
    {
      id: "doing",
      title: "Work in progress",
      groups: [],
      tasks: [
        {
          id: "3",
          content: "Conduct security testing",
          status: "STARTED",
        },
        {
          id: "4",
          content: "Analyze competitors",
          status: "STARTED",
        },
        {
          id: "12",
          content: "Implement error logging and monitoring",
          status: "STARTED",
        },
        {
          id: "13",
          content: "Design and implement responsive UI",
          status: "STARTED",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      groups: [],
      tasks: [
        {
          id: "5",
          content: "Create UI kit documentation",
          status: "DONE",
        },
        {
          id: "6",
          content: "Dev meeting",
          status: "DONE",
        },
        {
          id: "7",
          content: "Deliver dashboard prototype",
          status: "DONE",
        },
      ],
    },
  ],
};

const STORAGE_KEY = 'kanban-board-state';

function KanbanBoard() {
  const [board, setBoard] = useState<Board>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if the stored data has the new Current Intentions column
      if (parsed.columns && !parsed.columns.find((col: Column) => col.id === 'intentions')) {
        // Migration: Add the Current Intentions column as the first column
        const intentionsColumn = {
          id: "intentions",
          title: "Current Intentions",
          groups: [],
          tasks: [
            {
              id: "int1",
              content: "Track calories daily",
              status: "HABIT",
            },
            {
              id: "int2",
              content: "In bed by midnight",
              status: "HABIT",
            },
            {
              id: "int3",
              content: "Gym every day",
              status: "HABIT",
            },
            {
              id: "int4",
              content: "Read for 30 minutes",
              status: "HABIT",
            },
          ],
        };
        parsed.columns = [intentionsColumn, ...parsed.columns];
      }
      return parsed;
    }
    return defaultBoard;
  });
  const columnsId = useMemo(() => board.columns?.map((col) => col.id) || [], [board.columns]);
  
  const allTasks = useMemo(() => {
    const tasksWithColumnId: (Task & { columnId: Id })[] = [];
    if (board.columns) {
      board.columns.forEach(col => {
        if (col.tasks) {
          col.tasks.forEach(task => {
            tasksWithColumnId.push({ ...task, columnId: col.id });
          });
        }
      });
    }
    return tasksWithColumnId;
  }, [board.columns]);

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
  const [titleEditMode, setTitleEditMode] = useState(false);
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('kanban-notes');
    return stored || '';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  useEffect(() => {
    localStorage.setItem('kanban-legend-minimized', JSON.stringify(legendMinimized));
  }, [legendMinimized]);


  useEffect(() => {
    localStorage.setItem('kanban-notes', notes);
  }, [notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && deletedTask) {
        e.preventDefault();
        setBoard(prev => {
          const newBoard = { ...prev };
          const targetColumn = newBoard.columns.find(col => col.id === deletedTask.columnId);
          if (targetColumn) {
            targetColumn.tasks = [...targetColumn.tasks, deletedTask];
          }
          return newBoard;
        });
        setRedoTask(deletedTask);
        setDeletedTask(null);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'y' && redoTask) {
        e.preventDefault();
        const taskToRedo = redoTask;
        setDeletedTask(taskToRedo);
        setRedoTask(null);
        setBoard(prev => {
          const newBoard = { ...prev };
          newBoard.columns = newBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(task => task.id !== taskToRedo.id)
          }));
          return newBoard;
        });
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
  }, [deletedTask, redoTask, focusedTaskId, lastModifiedTaskId, board.columns]);

  const handleKeyboardNavigation = (key: string) => {
    if (allTasks.length === 0) return;

    // If no task is focused, focus the first task
    if (!focusedTaskId) {
      const firstTask = tasks[0];
      if (firstTask) {
        setFocusedTaskId(firstTask.id);
        focusTask(firstTask.id);
      }
      return;
    }

    const currentTask = allTasks.find(task => task.id === focusedTaskId);
    if (!currentTask) return;

    const currentColumn = columns.find(col => col.id === currentTask.columnId);
    if (!currentColumn) return;

    const tasksInCurrentColumn = allTasks.filter(task => task.columnId === currentColumn.id);
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
        const currentColumnIndex = board.columns.findIndex(col => col.id === currentColumn.id);
        if (currentColumnIndex > 0) {
          const prevColumn = board.columns[currentColumnIndex - 1];
          const tasksInPrevColumn = allTasks.filter(task => task.columnId === prevColumn.id);
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
          const nextColumn = board.columns[currentColIndex + 1];
          const tasksInNextColumn = allTasks.filter(task => task.columnId === nextColumn.id);
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
    if (allTasks.length === 0) return;

    // If a task is currently focused, remove focus
    if (focusedTaskId && allTasks.find(task => task.id === focusedTaskId)) {
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
    if (allTasks.length === 0) return;

    // Priority 1: Use the most recently focused task if it still exists
    if (focusedTaskId && allTasks.find(task => task.id === focusedTaskId)) {
      focusTask(focusedTaskId);
      return;
    }

    // Priority 2: Use the most recently modified task if it exists
    if (lastModifiedTaskId && allTasks.find(task => task.id === lastModifiedTaskId)) {
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

    const currentTask = allTasks.find(task => task.id === focusedTaskId);
    if (!currentTask) return;

    const currentColumn = columns.find(col => col.id === currentTask.columnId);
    if (!currentColumn) return;

    const tasksInCurrentColumn = allTasks.filter(task => task.columnId === currentColumn.id);
    const currentTaskIndex = tasksInCurrentColumn.findIndex(task => task.id === focusedTaskId);

    switch (key) {
      case 'ArrowUp':
        if (currentTaskIndex > 0) {
          // Move task up within the same column
          setBoard(prev => ({
            ...prev,
            columns: prev.columns.map(col => 
              col.id === currentColumn.id 
                ? { ...col, tasks: arrayMove(col.tasks, currentTaskIndex, currentTaskIndex - 1) }
                : col
            )
          }));
        }
        break;
      
      case 'ArrowDown':
        if (currentTaskIndex < tasksInCurrentColumn.length - 1) {
          // Move task down within the same column
          setBoard(prev => ({
            ...prev,
            columns: prev.columns.map(col => 
              col.id === currentColumn.id 
                ? { ...col, tasks: arrayMove(col.tasks, currentTaskIndex, currentTaskIndex + 1) }
                : col
            )
          }));
        }
        break;
      
      case 'ArrowLeft':
        const currentColumnIndex = board.columns?.findIndex(col => col.id === currentColumn.id) || -1;
        if (currentColumnIndex > 0) {
          // Move task to the previous column
          const prevColumn = board.columns?.[currentColumnIndex - 1];
          if (!prevColumn) break;
          
          setBoard(prev => {
            const taskToMove = prev.columns?.find(col => col.id === currentColumn.id)?.tasks?.find(task => task.id === focusedTaskId);
            if (!taskToMove) return prev;
            
            return {
              ...prev,
              columns: prev.columns?.map(col => {
                if (col.id === currentColumn.id) {
                  return { ...col, tasks: col.tasks?.filter(task => task.id !== focusedTaskId) || [] };
                } else if (col.id === prevColumn.id) {
                  return { ...col, tasks: [...(col.tasks || []), taskToMove] };
                }
                return col;
              }) || []
            };
          });
          // Re-focus the task after moving to a new column
          setTimeout(() => focusTask(focusedTaskId), 0);
        }
        break;
      
      case 'ArrowRight':
        const currentColIndex = board.columns?.findIndex(col => col.id === currentColumn.id) || -1;
        if (currentColIndex >= 0 && currentColIndex < (board.columns?.length || 0) - 1) {
          // Move task to the next column
          const nextColumn = board.columns?.[currentColIndex + 1];
          if (!nextColumn) break;
          
          setBoard(prev => {
            const taskToMove = prev.columns?.find(col => col.id === currentColumn.id)?.tasks?.find(task => task.id === focusedTaskId);
            if (!taskToMove) return prev;
            
            return {
              ...prev,
              columns: prev.columns?.map(col => {
                if (col.id === currentColumn.id) {
                  return { ...col, tasks: col.tasks?.filter(task => task.id !== focusedTaskId) || [] };
                } else if (col.id === nextColumn.id) {
                  return { ...col, tasks: [...(col.tasks || []), taskToMove] };
                }
                return col;
              }) || []
            };
          });
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
          {board.title}
        </h1>
      ) : (
        <input
          className="text-4xl font-bold text-black mb-12 bg-transparent border-b-2 border-blue-500 outline-none text-center"
          value={board.title}
          onChange={(e) => setBoard(prev => ({ ...prev, title: e.target.value }))}
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
              {board.columns?.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  toggleTaskComplete={toggleTaskComplete}
                  tasks={col.tasks}
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
                tasks={activeColumn.tasks}
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
      content: "",
      status: "TODO",
    };

    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col
      ) || []
    }));
    setLastModifiedTaskId(newTask.id);
  }

  function deleteTask(id: Id) {
    let taskToDelete: Task | null = null;
    let sourceColumnId: Id | null = null;
    
    if (board.columns) {
      board.columns.forEach(col => {
        const task = col.tasks?.find(task => task.id === id);
        if (task) {
          taskToDelete = task;
          sourceColumnId = col.id;
        }
      });
    }
    
    if (taskToDelete && sourceColumnId) {
      setDeletedTask({ ...taskToDelete, columnId: sourceColumnId });
      setRedoTask(null);
    }
    
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        tasks: col.tasks?.filter(task => task.id !== id) || []
      })) || []
    }));
  }

  function updateTask(id: Id, content: string) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        tasks: col.tasks?.map(task => 
          task.id === id ? { ...task, content } : task
        ) || []
      })) || []
    }));
    setLastModifiedTaskId(id);
  }

  function toggleTaskComplete(id: Id) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        tasks: col.tasks?.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        ) || []
      })) || []
    }));
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${(board.columns?.length || 0) + 1}`,
      groups: [],
      tasks: [],
    };

    setBoard(prev => ({
      ...prev,
      columns: [...(prev.columns || []), columnToAdd]
    }));
  }

  function deleteColumn(id: Id) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.filter(col => col.id !== id) || []
    }));
  }

  function updateColumn(id: Id, title: string) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => 
        col.id === id ? { ...col, title } : col
      ) || []
    }));
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

    setBoard(prev => {
      const columns = prev.columns || [];
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);
      
      return {
        ...prev,
        columns: arrayMove(columns, activeColumnIndex, overColumnIndex)
      };
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
      setBoard(prev => {
        let activeTask: Task | null = null;
        let overTask: Task | null = null;
        let activeColumnId: Id | null = null;
        let overColumnId: Id | null = null;
        
        // Find the active and over tasks
        if (prev.columns) {
          for (const col of prev.columns) {
            const activeFound = col.tasks?.find(t => t.id === activeId);
            const overFound = col.tasks?.find(t => t.id === overId);
            if (activeFound) {
              activeTask = activeFound;
              activeColumnId = col.id;
            }
            if (overFound) {
              overTask = overFound;
              overColumnId = col.id;
            }
          }
        }
        
        if (!activeTask || !overTask || !activeColumnId || !overColumnId) return prev;
        
        return {
          ...prev,
          columns: prev.columns?.map(col => {
            if (col.id === activeColumnId && col.id === overColumnId) {
              // Same column - reorder tasks
              const activeIndex = col.tasks?.findIndex(t => t.id === activeId) || 0;
              const overIndex = col.tasks?.findIndex(t => t.id === overId) || 0;
              return { ...col, tasks: arrayMove(col.tasks || [], activeIndex, overIndex) };
            } else if (col.id === activeColumnId) {
              // Remove from active column
              return { ...col, tasks: col.tasks?.filter(t => t.id !== activeId) || [] };
            } else if (col.id === overColumnId) {
              // Add to over column at the right position
              const overIndex = col.tasks?.findIndex(t => t.id === overId) || 0;
              const newTasks = [...(col.tasks || [])];
              newTasks.splice(overIndex, 0, activeTask);
              return { ...col, tasks: newTasks };
            }
            return col;
          }) || []
        };
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setBoard(prev => {
        let activeTask: Task | null = null;
        let activeColumnId: Id | null = null;
        
        // Find the active task
        if (prev.columns) {
          for (const col of prev.columns) {
            const found = col.tasks?.find(t => t.id === activeId);
            if (found) {
              activeTask = found;
              activeColumnId = col.id;
              break;
            }
          }
        }
        
        if (!activeTask || !activeColumnId) return prev;
        
        return {
          ...prev,
          columns: prev.columns?.map(col => {
            if (col.id === activeColumnId) {
              // Remove from active column
              return { ...col, tasks: col.tasks?.filter(t => t.id !== activeId) || [] };
            } else if (col.id === overId) {
              // Add to target column
              return { ...col, tasks: [...(col.tasks || []), activeTask] };
            }
            return col;
          }) || []
        };
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
