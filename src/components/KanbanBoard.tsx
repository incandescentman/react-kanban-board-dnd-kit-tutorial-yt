import PlusIcon from "../icons/PlusIcon";
import { useMemo, useState, useEffect, useCallback } from "react";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Plus, HelpCircle, Clipboard, Command, Tag, Archive, Trash2, Edit3 } from 'lucide-react';

import CommandPalette from "./CommandPalette";
import TagView from "./TagView";
import Legend from "./Legend";
import BoardSelector from "./BoardSelector";
import GroupContainer from "./GroupContainer";
import IntentionsPanel from "./IntentionsPanel";

const DATA_VERSION = 2;

function KanbanBoard() {
  const [board, setBoard] = useState<Board>(() => {
    const saved = localStorage.getItem('kanban-board-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Check if this is version 1 data (flat structure)
        if (!parsed.dataVersion || parsed.dataVersion < DATA_VERSION) {
          console.log(`Migrating board data from version ${parsed.dataVersion || 1} to ${DATA_VERSION}`);
          
          // Migrate from version 1 to version 2
          if (parsed.columns && parsed.tasks) {
            const migratedColumns = parsed.columns.map((col: any) => ({
              ...col,
              tasks: parsed.tasks.filter((task: any) => task.columnId === col.id),
              groups: [] // Add empty groups array
            }));
            
            const migratedBoard = {
              title: parsed.title || "Kanban Board",
              columns: migratedColumns,
              dataVersion: DATA_VERSION
            };
            
            // Save migrated data
            localStorage.setItem('kanban-board-state', JSON.stringify(migratedBoard));
            return migratedBoard;
          }
        }
        
        // Ensure the board has the correct structure
        return {
          title: parsed.title || "Kanban Board",
          columns: parsed.columns?.map((col: any) => ({
            ...col,
            tasks: col.tasks || [],
            groups: col.groups || []
          })) || [],
          dataVersion: DATA_VERSION
        };
      } catch (error) {
        console.error('Error parsing saved board data:', error);
      }
    }
    
    return {
      title: "Sunjay's Post-OpenAI Action Plan",
      columns: [
        {
          id: 7746,
          title: "Ideas",
          tasks: [
            {
              id: 9439,
              content: "Write job descriptions",
              completed: false,
              tags: []
            }
          ],
          groups: []
        },
        {
          id: "todo",
          title: "To Do",
          tasks: [],
          groups: [
            {
              id: "july-items",
              title: "July items",
              tasks: [
                {
                  id: 7350,
                  content: "Pick up laundry",
                  completed: false,
                  tags: []
                },
                {
                  id: 6263,
                  content: "Do project",
                  completed: false,
                  tags: []
                }
              ]
            }
          ]
        },
        {
          id: "doing",
          title: "In Progress",
          tasks: [
            {
              id: 5374,
              content: "Write chapter",
              completed: false,
              tags: []
            }
          ],
          groups: []
        },
        {
          id: "done",
          title: "Done",
          tasks: [
            {
              id: 5056,
              content: "Publish blog post",
              completed: true,
              tags: []
            }
          ],
          groups: []
        }
      ],
      dataVersion: DATA_VERSION
    };
  });

  const [allTags, setAllTags] = useState<Set<string>>(new Set());
  const [currentBoardName, setCurrentBoardName] = useState<string>('kanban-board-state');
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [boardOrder, setBoardOrder] = useState<string[]>([]);
  const [boardSelectorMinimized, setBoardSelectorMinimized] = useState(false);

  // Extract and set all tags whenever board changes
  useEffect(() => {
    const extractedTags = new Set<string>();
    
    board.columns?.forEach(column => {
      column.tasks?.forEach(task => {
        task.tags?.forEach(tag => extractedTags.add(tag));
      });
      column.groups?.forEach(group => {
        group.tasks?.forEach(task => {
          task.tags?.forEach(tag => extractedTags.add(tag));
        });
      });
    });
    
    console.log('All tags:', Array.from(extractedTags));
    setAllTags(extractedTags);
  }, [board]);

  // Load available boards and their order on component mount
  useEffect(() => {
    const recoveredBoards = findAllBoards();
    console.log('Found recoverable boards:', recoveredBoards);
    
    // Load saved board order
    const savedOrder = localStorage.getItem('kanban-board-order');
    let boardOrder: string[] = [];
    
    if (savedOrder) {
      try {
        boardOrder = JSON.parse(savedOrder);
        // Filter out boards that no longer exist
        boardOrder = boardOrder.filter(boardName => recoveredBoards.includes(boardName));
      } catch (error) {
        console.error('Error parsing board order:', error);
      }
    }
    
    // Add any new boards that aren't in the saved order
    const newBoards = recoveredBoards.filter(boardName => !boardOrder.includes(boardName));
    const orderedBoards = [...boardOrder, ...newBoards];
    
    setAvailableBoards(orderedBoards);
    setBoardOrder(orderedBoards);
  }, []);

  // Function to find all boards in localStorage
  const findAllBoards = (): string[] => {
    const boards: string[] = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Only look for keys that start with 'kanban-board-state' to avoid parsing non-JSON keys
      if (key && key.startsWith('kanban-board-state')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            // Check if it looks like a board (has title and columns)
            if (parsed.title && parsed.columns) {
              boards.push(key);
            }
          }
        } catch (error) {
          console.error(`Error parsing localStorage key ${key}:`, error);
        }
      }
    }
    
    return boards;
  };

  // Debug localStorage contents
  useEffect(() => {
    if (availableBoards.length > 0) {
      const allData = availableBoards.reduce((acc, boardName) => {
        const data = localStorage.getItem(boardName);
        if (data) {
          try {
            acc[boardName] = JSON.parse(data);
          } catch (error) {
            acc[boardName] = data;
          }
        }
        return acc;
      }, {} as Record<string, any>);
      
      console.log('All board-related data found:', allData);
      console.log('Raw localStorage keys:', Object.keys(localStorage).filter(k => 
        k.includes('kanban') || k.includes('board')
      ));
      
      Object.keys(allData).forEach(boardName => {
        const data = allData[boardName];
        if (data && typeof data === 'object') {
          console.log(data);
        }
      });
    }
  }, [availableBoards]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<Id | null>(null);

  const [legendMinimized, setLegendMinimized] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [tagViewOpen, setTagViewOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  // Enhanced undo system
  interface UndoAction {
    type: 'DELETE_TASK' | 'DELETE_COLUMN' | 'DELETE_BOARD';
    data: any;
    timestamp: number;
  }

  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const [columnMoveMode, setColumnMoveMode] = useState(false);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('kanban-notes');
    return saved || '';
  });

  const [intentions, setIntentions] = useState<string[]>(() => {
    const saved = localStorage.getItem('kanban-intentions');
    return saved ? JSON.parse(saved) : [
      "Focus on high-impact tasks",
      "Complete one thing at a time",
      "Take breaks when needed"
    ];
  });

  // Auto-save notes to localStorage
  useEffect(() => {
    localStorage.setItem('kanban-notes', notes);
  }, [notes]);

  // Auto-save intentions to localStorage
  useEffect(() => {
    localStorage.setItem('kanban-intentions', JSON.stringify(intentions));
  }, [intentions]);

  // Auto-save board state to localStorage
  useEffect(() => {
    localStorage.setItem(currentBoardName, JSON.stringify(board));
  }, [board, currentBoardName]);

  const columnsId = useMemo(() => {
    return board.columns?.map((col) => col.id) || [];
  }, [board.columns]);

  const switchToBoard = (boardName: string) => {
    try {
      const boardData = localStorage.getItem(boardName);
      if (boardData) {
        const parsed = JSON.parse(boardData);
        setBoard(parsed);
        setCurrentBoardName(boardName);
      }
    } catch (error) {
      console.error('Error switching to board:', error);
    }
  };

  const deleteOrArchiveBoard = (boardName: string) => {
    try {
      // Get the board content before deleting
      const boardContent = localStorage.getItem(boardName);
      const boardIndex = availableBoards.findIndex(name => name === boardName);
      
      if (boardContent && boardIndex !== -1) {
        // Store undo action
        addUndoAction({
          type: 'DELETE_BOARD',
          data: {
            boardName,
            boardContent,
            index: boardIndex
          },
          timestamp: Date.now()
        });
      }
      
      // Remove from localStorage
      localStorage.removeItem(boardName);
      
      // Update available boards list
      const updatedBoards = availableBoards.filter(name => name !== boardName);
      setAvailableBoards(updatedBoards);
      setBoardOrder(updatedBoards);
      
      // Save updated order
      localStorage.setItem('kanban-board-order', JSON.stringify(updatedBoards));
      
      // If we deleted the current board, switch to the default one
      if (boardName === currentBoardName) {
        const defaultBoard = updatedBoards.length > 0 ? updatedBoards[0] : 'kanban-board-state';
        switchToBoard(defaultBoard);
      }
    } catch (error) {
      console.error('Error deleting/archiving board:', error);
    }
  };

  const handleBoardReorder = (reorderedBoards: { name: string; title: string }[]) => {
    const newOrder = reorderedBoards.map(board => board.name);
    setAvailableBoards(newOrder);
    setBoardOrder(newOrder);
    
    // Save the new order to localStorage
    localStorage.setItem('kanban-board-order', JSON.stringify(newOrder));
  };

  const commands = [
    {
      id: 'add-column',
      label: 'Add Column',
      action: () => createNewColumn(),
      icon: Plus
    },
    {
      id: 'toggle-legend',
      label: 'Toggle Legend',
      action: () => setLegendMinimized(!legendMinimized),
      icon: HelpCircle
    },
    {
      id: 'show-tags',
      label: 'Show Tags',
      action: () => setTagViewOpen(true),
      icon: Tag
    },
    {
      id: 'board-selector',
      label: 'Board Selector',
      action: () => setBoardSelectorMinimized(!boardSelectorMinimized),
      icon: Archive
    },
    {
      id: 'column-move-mode',
      label: 'Toggle Column Move Mode',
      action: () => setColumnMoveMode(!columnMoveMode),
      icon: Edit3
    }
  ];

  const handleKeyboardNavigation = (key: string) => {
    if (!focusedTaskId) return;

    const allTasks = getAllTasks();
    const currentIndex = allTasks.findIndex(task => task.id === focusedTaskId);
    
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    
    switch (key) {
      case 'ArrowUp':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        newIndex = Math.min(allTasks.length - 1, currentIndex + 1);
        break;
      case 'ArrowLeft':
        // Find task in previous column
        const currentTask = allTasks[currentIndex];
        const { columnIndex, taskIndex } = findTaskPosition(currentTask.id);
        if (columnIndex > 0) {
          const prevColumn = board.columns?.[columnIndex - 1];
          if (prevColumn) {
            const prevTasks = getColumnTasks(prevColumn);
            const targetIndex = Math.min(taskIndex, prevTasks.length - 1);
            if (targetIndex >= 0) {
              setFocusedTaskId(prevTasks[targetIndex].id);
              return;
            }
          }
        }
        break;
      case 'ArrowRight':
        // Find task in next column
        const currentTask2 = allTasks[currentIndex];
        const { columnIndex: colIndex, taskIndex: taskIdx } = findTaskPosition(currentTask2.id);
        if (colIndex < (board.columns?.length || 0) - 1) {
          const nextColumn = board.columns?.[colIndex + 1];
          if (nextColumn) {
            const nextTasks = getColumnTasks(nextColumn);
            const targetIndex = Math.min(taskIdx, nextTasks.length - 1);
            if (targetIndex >= 0) {
              setFocusedTaskId(nextTasks[targetIndex].id);
              return;
            }
          }
        }
        break;
    }
    
    if (newIndex !== currentIndex && allTasks[newIndex]) {
      setFocusedTaskId(allTasks[newIndex].id);
    }
  };

  const getAllTasks = (): Task[] => {
    const tasks: Task[] = [];
    board.columns?.forEach(column => {
      column.tasks?.forEach(task => tasks.push(task));
      column.groups?.forEach(group => {
        group.tasks?.forEach(task => tasks.push(task));
      });
    });
    return tasks;
  };

  const getColumnTasks = (column: Column): Task[] => {
    const tasks: Task[] = [];
    column.tasks?.forEach(task => tasks.push(task));
    column.groups?.forEach(group => {
      group.tasks?.forEach(task => tasks.push(task));
    });
    return tasks;
  };

  const findTaskPosition = (taskId: Id): { columnIndex: number; taskIndex: number } => {
    for (let colIndex = 0; colIndex < (board.columns?.length || 0); colIndex++) {
      const column = board.columns?.[colIndex];
      if (column) {
        const columnTasks = getColumnTasks(column);
        const taskIndex = columnTasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          return { columnIndex: colIndex, taskIndex };
        }
      }
    }
    return { columnIndex: -1, taskIndex: -1 };
  };

  const handleKeyboardDragDrop = (key: string) => {
    if (!focusedTaskId) return;

    const currentTask = getAllTasks().find(task => task.id === focusedTaskId);
    if (!currentTask) return;

    const { columnIndex, taskIndex } = findTaskPosition(focusedTaskId);
    if (columnIndex === -1) return;

    const currentColumn = board.columns?.[columnIndex];
    if (!currentColumn) return;

    let targetColumnIndex = columnIndex;
    let targetTaskIndex = taskIndex;

    switch (key) {
      case 'ArrowUp':
        targetTaskIndex = Math.max(0, taskIndex - 1);
        break;
      case 'ArrowDown':
        const currentColumnTasks = getColumnTasks(currentColumn);
        targetTaskIndex = Math.min(currentColumnTasks.length - 1, taskIndex + 1);
        break;
      case 'ArrowLeft':
        targetColumnIndex = Math.max(0, columnIndex - 1);
        break;
      case 'ArrowRight':
        targetColumnIndex = Math.min((board.columns?.length || 0) - 1, columnIndex + 1);
        break;
    }

    if (targetColumnIndex !== columnIndex || targetTaskIndex !== taskIndex) {
      // Perform the move
      moveTaskToPosition(focusedTaskId, targetColumnIndex, targetTaskIndex);
    }
  };

  const moveTaskToPosition = (taskId: Id, targetColumnIndex: number, targetTaskIndex: number) => {
    setBoard(prev => {
      const newColumns = [...(prev.columns || [])];
      const sourceColumnIndex = findTaskPosition(taskId).columnIndex;
      
      if (sourceColumnIndex === -1 || targetColumnIndex >= newColumns.length) return prev;
      
      const sourceColumn = newColumns[sourceColumnIndex];
      const targetColumn = newColumns[targetColumnIndex];
      
      let taskToMove: Task | null = null;
      
      // Remove task from source
      if (sourceColumn.tasks) {
        const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          taskToMove = sourceColumn.tasks[taskIndex];
          sourceColumn.tasks.splice(taskIndex, 1);
        }
      }
      
      if (!taskToMove) {
        // Check groups
        for (const group of sourceColumn.groups || []) {
          const taskIndex = group.tasks?.findIndex(task => task.id === taskId) || -1;
          if (taskIndex !== -1) {
            taskToMove = group.tasks?.[taskIndex] || null;
            group.tasks?.splice(taskIndex, 1);
            break;
          }
        }
      }
      
      if (!taskToMove) return prev;
      
      // Add task to target
      if (sourceColumnIndex === targetColumnIndex) {
        // Same column, just reorder
        const allTasks = getColumnTasks(targetColumn);
        const insertIndex = Math.min(targetTaskIndex, allTasks.length);
        targetColumn.tasks = targetColumn.tasks || [];
        targetColumn.tasks.splice(insertIndex, 0, taskToMove);
      } else {
        // Different column
        targetColumn.tasks = targetColumn.tasks || [];
        const insertIndex = Math.min(targetTaskIndex, targetColumn.tasks.length);
        targetColumn.tasks.splice(insertIndex, 0, taskToMove);
      }
      
      return { ...prev, columns: newColumns };
    });
  };

  const toggleKeyboardFocus = () => {
    if (focusedTaskId) {
      // If something is focused, unfocus it
      setFocusedTaskId(null);
    } else {
      // If nothing is focused, focus the first task
      const allTasks = getAllTasks();
      if (allTasks.length > 0) {
        // Try to find the most recently modified task, or fall back to the first task
        const lastModifiedTask = allTasks[0]; // You could implement last modified tracking
        setFocusedTaskId(lastModifiedTask.id);
      }
    }
  };

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Command palette
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Undo/Redo
      if (e.metaKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (e.metaKey && e.key === 'y' || (e.metaKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
        return;
      }

      // Column move mode toggle
      if (e.metaKey && e.key === 'm') {
        e.preventDefault();
        setColumnMoveMode(!columnMoveMode);
        return;
      }

      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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

      if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && e.metaKey) {
        // Don't interfere when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        // Add new task when meta+enter is pressed
        if (focusedTaskId) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find which column the focused task is in
          const { columnIndex } = findTaskPosition(focusedTaskId);
          if (columnIndex !== -1 && board.columns?.[columnIndex]) {
            createTask(board.columns[columnIndex].id);
          }
        }
      }

      // Toggle legend
      if (e.key === '?' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // Don't interfere when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        setLegendMinimized(!legendMinimized);
      }

      // Tag view
      if (e.key === 't' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // Don't interfere when editing text
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        setTagViewOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [focusedTaskId, legendMinimized, columnMoveMode]);

  const addUndoAction = (action: UndoAction) => {
    setUndoStack(prev => [...prev.slice(-9), action]); // Keep only last 10 actions
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const action = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      
      switch (action.type) {
        case 'DELETE_TASK':
          restoreTask(action.data);
          break;
        case 'DELETE_COLUMN':
          restoreColumn(action.data);
          break;
        case 'DELETE_BOARD':
          restoreBoard(action.data);
          break;
      }
      
      setRedoStack(prev => [...prev, action]);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const action = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      
      switch (action.type) {
        case 'DELETE_TASK':
          deleteTask(action.data.task.id);
          break;
        case 'DELETE_COLUMN':
          deleteColumn(action.data.column.id);
          break;
        case 'DELETE_BOARD':
          deleteOrArchiveBoard(action.data.boardName);
          break;
      }
      
      setUndoStack(prev => [...prev, action]);
    }
  };

  const restoreTask = (taskData: any) => {
    const { task, columnId, groupId } = taskData;
    
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => {
        if (col.id === columnId) {
          if (groupId) {
            // Restore to group
            return {
              ...col,
              groups: col.groups?.map(group => 
                group.id === groupId 
                  ? { ...group, tasks: [...(group.tasks || []), task] }
                  : group
              ) || []
            };
          } else {
            // Restore to column
            return {
              ...col,
              tasks: [...(col.tasks || []), task]
            };
          }
        }
        return col;
      }) || []
    }));
  };

  const restoreColumn = (columnData: any) => {
    const { column, index } = columnData;
    
    setBoard(prev => {
      const newColumns = [...(prev.columns || [])];
      newColumns.splice(index, 0, column);
      return {
        ...prev,
        columns: newColumns
      };
    });
    
    // Update available boards list
    const newOrder = [...availableBoards];
    setAvailableBoards(newOrder);
    setBoardOrder(newOrder);
    localStorage.setItem('kanban-board-order', JSON.stringify(newOrder));
  };

  const restoreBoard = (boardData: any) => {
    const { boardName, boardContent, index } = boardData;
    
    // Restore board to localStorage
    localStorage.setItem(boardName, boardContent);
    
    // Update available boards list
    const newBoards = [...availableBoards];
    newBoards.splice(index, 0, boardName);
    setAvailableBoards(newBoards);
    setBoardOrder(newBoards);
    localStorage.setItem('kanban-board-order', JSON.stringify(newBoards));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setTagViewOpen(true);
  };

  const updateBoardTitle = (newTitle: string) => {
    setBoard(prev => ({ ...prev, title: newTitle }));
  };

  const createTaskWithContent = (columnId: Id, content: string): Id => {
    const newTask: Task = {
      id: generateId(),
      content,
      completed: false,
      tags: []
    };

    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col
      ) || []
    }));

    return newTask.id;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }, []);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    const isActiveATask = active.data.current?.type === "Task";

    // Only handle column reordering if we're in column move mode AND dragging a column
    if (isActiveAColumn && columnMoveMode) {
      setBoard(prev => {
        const columns = prev.columns || [];
        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);
        
        if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
          return {
            ...prev,
            columns: arrayMove(columns, activeColumnIndex, overColumnIndex)
          };
        }
        
        return prev;
      });
    }
    
    // Task dragging is handled in onDragOver, so we don't need to do anything here for tasks
    // This prevents accidental column reordering when dragging tasks
  }, [columnMoveMode]);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";
    const isOverAGroup = over.data.current?.type === "Group";

    if (!isActiveATask) return;

    // Priority order: Group > Task > Column
    // This prevents multiple handlers from running for the same drop

    // Im dropping a Task over a group (highest priority)
    if (isActiveATask && isOverAGroup) {
      setBoard(prev => {
        let activeTask: Task | null = null;
        let activeColumnId: Id | null = null;
        let activeGroupId: string | null = null;
        let targetColumnId: Id | null = null;
        
        // Find the active task (could be in column tasks or group tasks)
        if (prev.columns) {
          for (const col of prev.columns) {
            // Check column tasks
            const found = col.tasks?.find(t => t.id === activeId);
            if (found) {
              activeTask = found;
              activeColumnId = col.id;
              break;
            }
            
            // Check group tasks
            if (col.groups) {
              for (const group of col.groups) {
                const groupFound = group.tasks?.find(t => t.id === activeId);
                if (groupFound) {
                  activeTask = groupFound;
                  activeColumnId = col.id;
                  activeGroupId = group.id;
                  break;
                }
              }
              if (activeTask) break;
            }
          }
          
          // Find the target column (column that contains the target group)
          for (const col of prev.columns) {
            if (col.groups?.some(group => group.id === overId)) {
              targetColumnId = col.id;
              break;
            }
          }
        }
        
        if (!activeTask || !activeColumnId || !targetColumnId) {
          return prev;
        }
        
        return {
          ...prev,
          columns: prev.columns?.map(col => {
            let newCol = { ...col };
            
            // Remove from source
            if (col.id === activeColumnId) {
              if (!activeGroupId) {
                // Remove from column tasks
                newCol.tasks = col.tasks?.filter(t => t.id !== activeId) || [];
              } else {
                // Remove from group tasks
                newCol.groups = col.groups?.map(group => 
                  group.id === activeGroupId 
                    ? { ...group, tasks: group.tasks?.filter(t => t.id !== activeId) || [] }
                    : group
                ) || [];
              }
            }
            
            // Add to target group (only if this is the target column)
            if (col.id === targetColumnId) {
              newCol.groups = newCol.groups?.map(group => 
                group.id === overId 
                  ? { ...group, tasks: [...(group.tasks || []), activeTask] }
                  : group
              ) || [];
            }
            
            return newCol;
          }) || []
        };
      });
      return; // Exit early to prevent other handlers from running
    }

    // Im dropping a Task over another Task (second priority)
    if (isActiveATask && isOverATask) {
      setBoard(prev => {
        let activeTask: Task | null = null;
        let overTask: Task | null = null;
        let activeColumnId: Id | null = null;
        let overColumnId: Id | null = null;
        let activeGroupId: string | null = null;
        let overGroupId: string | null = null;
        
        // Find the active and over tasks (search both column tasks and group tasks)
        if (prev.columns) {
          for (const col of prev.columns) {
            // Check column tasks
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
            
            // Check group tasks
            if (col.groups) {
              for (const group of col.groups) {
                const activeGroupFound = group.tasks?.find(t => t.id === activeId);
                const overGroupFound = group.tasks?.find(t => t.id === overId);
                if (activeGroupFound) {
                  activeTask = activeGroupFound;
                  activeColumnId = col.id;
                  activeGroupId = group.id;
                }
                if (overGroupFound) {
                  overTask = overGroupFound;
                  overColumnId = col.id;
                  overGroupId = group.id;
                }
              }
            }
          }
        }
        
        if (!activeTask || !overTask || !activeColumnId || !overColumnId) return prev;
        
        return {
          ...prev,
          columns: prev.columns?.map(col => {
            let newCol = { ...col };
            
            // Same column and same group - reorder within group
            if (col.id === activeColumnId && col.id === overColumnId && activeGroupId && overGroupId && activeGroupId === overGroupId) {
              newCol.groups = col.groups?.map(group => {
                if (group.id === activeGroupId) {
                  const activeIndex = group.tasks?.findIndex(t => t.id === activeId) || 0;
                  const overIndex = group.tasks?.findIndex(t => t.id === overId) || 0;
                  return { ...group, tasks: arrayMove(group.tasks || [], activeIndex, overIndex) };
                }
                return group;
              }) || [];
            }
            // Same column, both in column tasks - reorder column tasks
            else if (col.id === activeColumnId && col.id === overColumnId && !activeGroupId && !overGroupId) {
              const activeIndex = col.tasks?.findIndex(t => t.id === activeId) || 0;
              const overIndex = col.tasks?.findIndex(t => t.id === overId) || 0;
              newCol.tasks = arrayMove(col.tasks || [], activeIndex, overIndex);
            }
            // Cross-container movement
            else {
              // Remove from source
              if (col.id === activeColumnId) {
                if (activeGroupId) {
                  // Remove from group
                  newCol.groups = col.groups?.map(group => 
                    group.id === activeGroupId 
                      ? { ...group, tasks: group.tasks?.filter(t => t.id !== activeId) || [] }
                      : group
                  ) || [];
                } else {
                  // Remove from column tasks
                  newCol.tasks = col.tasks?.filter(t => t.id !== activeId) || [];
                }
              }
              
              // Add to target
              if (col.id === overColumnId) {
                if (overGroupId) {
                  // Add to group at position
                  newCol.groups = col.groups?.map(group => {
                    if (group.id === overGroupId) {
                      const overIndex = group.tasks?.findIndex(t => t.id === overId) || 0;
                      const newTasks = [...(group.tasks || [])];
                      newTasks.splice(overIndex, 0, activeTask);
                      return { ...group, tasks: newTasks };
                    }
                    return group;
                  }) || [];
                } else {
                  // Add to column tasks at position
                  const overIndex = col.tasks?.findIndex(t => t.id === overId) || 0;
                  const newTasks = [...(col.tasks || [])];
                  newTasks.splice(overIndex, 0, activeTask);
                  newCol.tasks = newTasks;
                }
              }
            }
            
            return newCol;
          }) || []
        };
      });
      return; // Exit early to prevent other handlers from running
    }

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setBoard(prev => {
        let activeTask: Task | null = null;
        let activeColumnId: Id | null = null;
        let activeGroupId: string | null = null;
        
        // Find the active task (could be in column tasks or group tasks)
        if (prev.columns) {
          for (const col of prev.columns) {
            // Check column tasks
            const found = col.tasks?.find(t => t.id === activeId);
            if (found) {
              activeTask = found;
              activeColumnId = col.id;
              break;
            }
            
            // Check group tasks
            if (col.groups) {
              for (const group of col.groups) {
                const groupFound = group.tasks?.find(t => t.id === activeId);
                if (groupFound) {
                  activeTask = groupFound;
                  activeColumnId = col.id;
                  activeGroupId = group.id;
                  break;
                }
              }
              if (activeTask) break;
            }
          }
        }
        
        if (!activeTask || !activeColumnId) return prev;
        
        return {
          ...prev,
          columns: prev.columns?.map(col => {
            let newCol = { ...col };
            
            // FIRST remove from source column
            if (col.id === activeColumnId) {
              if (!activeGroupId) {
                // Remove from column tasks
                newCol.tasks = col.tasks?.filter(t => t.id !== activeId) || [];
              } else {
                // Remove from group tasks
                newCol.groups = col.groups?.map(group => 
                  group.id === activeGroupId 
                    ? { ...group, tasks: group.tasks?.filter(t => t.id !== activeId) || [] }
                    : group
                ) || [];
              }
            }
            
            // THEN add to target column (if this is the target column)
            if (col.id === overId) {
              newCol.tasks = [...(newCol.tasks || []), activeTask];
            }
            
            return newCol;
          }) || []
        };
      });
    }
  }, []);

  return (
    <TooltipProvider>
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
        "
        style={{
          background: 'white',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className="m-auto flex gap-6">
            {/* Sidebar */}
            <div className={`flex flex-col gap-4 transition-all duration-300 ${boardSelectorMinimized ? 'mt-0' : ''}`}>
              {/* Board Selector */}
              {!boardSelectorMinimized && (
                <BoardSelector 
                  currentBoard={currentBoardName}
                  currentBoardTitle={board.title}
                  availableBoards={availableBoards.map(boardName => {
                    // Extract title from localStorage or use a default
                    try {
                      const boardData = localStorage.getItem(boardName);
                      if (boardData) {
                        const parsed = JSON.parse(boardData);
                        return {
                          name: boardName,
                          title: parsed.title || boardName
                        };
                      }
                    } catch (error) {
                      // Fallback if parsing fails
                    }
                    return {
                      name: boardName,
                      title: boardName
                    };
                  })}
                  onBoardChange={switchToBoard}
                  onBoardDelete={deleteOrArchiveBoard}
                  onBoardReorder={handleBoardReorder}
                  minimized={boardSelectorMinimized}
                  onMinimize={() => setBoardSelectorMinimized(true)}
                />
              )}
              
              {/* Intentions Panel */}
              <IntentionsPanel 
                intentions={intentions}
                setIntentions={setIntentions}
              />
              
              {/* Legend */}
              {!legendMinimized && (
                <Legend onMinimize={() => setLegendMinimized(true)} />
              )}
              
              {/* Notes Section */}
              <div className="w-80 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col min-w-0">
              {/* Title */}
              <div className="flex items-center gap-2 mb-4">
                <Input
                  value={board.title}
                  onChange={(e) => updateBoardTitle(e.target.value)}
                  className="text-2xl font-bold border-none bg-transparent px-0 focus:ring-0 focus:border-b-2 focus:border-blue-500"
                  style={{ fontFamily: 'Inter Tight, sans-serif' }}
                />
                {columnMoveMode && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Column Move Mode
                  </span>
                )}
              </div>

              {/* Columns */}
              <div className="flex gap-4">
                <div className="flex gap-4">
                  <SortableContext items={columnsId}>
                    {board.columns?.map((col) => (
                      <ColumnContainer
                        key={col.id}
                        column={col}
                        deleteColumn={deleteColumn}
                        updateColumn={updateColumn}
                        createTask={createTask}
                        tasks={col.tasks || []}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        toggleTaskComplete={toggleTaskComplete}
                        toggleGroupComplete={toggleGroupComplete}
                        updateGroup={updateGroup}
                        deleteGroup={deleteGroup}
                        convertTaskToHeading={convertTaskToHeading}
                        focusedTaskId={focusedTaskId}
                        setFocusedTaskId={setFocusedTaskId}
                        columnMoveMode={columnMoveMode}
                        onTagClick={handleTagClick}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            </div>
          </div>

          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={activeColumn.tasks || []}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  toggleTaskComplete={toggleTaskComplete}
                  toggleGroupComplete={toggleGroupComplete}
                  updateGroup={updateGroup}
                  deleteGroup={deleteGroup}
                  convertTaskToHeading={convertTaskToHeading}
                  focusedTaskId={focusedTaskId}
                  setFocusedTaskId={setFocusedTaskId}
                  columnMoveMode={columnMoveMode}
                  onTagClick={handleTagClick}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  toggleTaskComplete={toggleTaskComplete}
                  convertTaskToHeading={convertTaskToHeading}
                  focusedTaskId={focusedTaskId}
                  setFocusedTaskId={setFocusedTaskId}
                  onTagClick={handleTagClick}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
        
        {/* Undo Notification */}
        {undoStack.length > 0 && (
          <div className="fixed bottom-4 left-4 z-20">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
              <span className="text-sm">
                {undoStack[undoStack.length - 1].type === 'DELETE_TASK' && 'Task deleted'}
                {undoStack[undoStack.length - 1].type === 'DELETE_COLUMN' && 'Column deleted'}
                {undoStack[undoStack.length - 1].type === 'DELETE_BOARD' && 'Board deleted'}
              </span>
              <button
                onClick={undo}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                Undo (⌘Z)
              </button>
            </div>
          </div>
        )}

        {/* Bottom Right Corner Icons */}
        <div className="fixed bottom-4 right-4 flex gap-2 z-10">
          {/* Minimized Board Selector */}
          {boardSelectorMinimized && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative">
                  <Button
                    onClick={() => setBoardSelectorMinimized(false)}
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full shadow-lg bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                  <TooltipContent side="left">
                    Show Boards
                  </TooltipContent>
                </div>
              </TooltipTrigger>
            </Tooltip>
          )}
          
          {/* Add Column Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative">
                <Button
                  onClick={() => createNewColumn()}
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-full shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <TooltipContent side="left">
                  Add Column
                </TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
          
          {/* Minimized Legend */}
          {legendMinimized && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative">
                  <Button
                    onClick={() => setLegendMinimized(false)}
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full shadow-lg"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                  <TooltipContent side="left">
                    Show Keyboard Shortcuts
                  </TooltipContent>
                </div>
              </TooltipTrigger>
            </Tooltip>
          )}
        </div>

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          commands={commands}
        />

        {/* Tag View */}
        <TagView
          isOpen={tagViewOpen}
          onClose={() => setTagViewOpen(false)}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          tags={Array.from(allTags)}
          board={board}
        />
      </div>
    </TooltipProvider>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      content: `Task ${generateId()}`,
      completed: false,
      tags: []
    };

    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col
      ) || []
    }));

    // Auto-focus the new task
    setFocusedTaskId(newTask.id);
  }

  function deleteTask(id: Id) {
    // Find and store the task being deleted for undo functionality
    let taskToDelete: Task | null = null;
    let columnId: Id | null = null;
    let groupId: string | null = null;

    // Find the task and its location
    for (const col of board.columns || []) {
      // Check column tasks
      const foundTask = col.tasks?.find(task => task.id === id);
      if (foundTask) {
        taskToDelete = foundTask;
        columnId = col.id;
        break;
      }
      
      // Check group tasks
      for (const group of col.groups || []) {
        const foundGroupTask = group.tasks?.find(task => task.id === id);
        if (foundGroupTask) {
          taskToDelete = foundGroupTask;
          columnId = col.id;
          groupId = group.id;
          break;
        }
      }
      if (taskToDelete) break;
    }

    if (taskToDelete && columnId) {
      // Store undo action
      addUndoAction({
        type: 'DELETE_TASK',
        data: {
          task: taskToDelete,
          columnId,
          groupId
        },
        timestamp: Date.now()
      });
    }

    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        tasks: col.tasks?.filter(task => task.id !== id) || [],
        groups: col.groups?.map(group => ({
          ...group,
          tasks: group.tasks?.filter(task => task.id !== id) || []
        })) || []
      })) || []
    }));

    // Clear focus if the focused task was deleted
    if (focusedTaskId === id) {
      setFocusedTaskId(null);
    }
  }

  function updateTask(id: Id, content: string) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        tasks: col.tasks?.map(task => 
          task.id === id ? { ...task, content } : task
        ) || [],
        groups: col.groups?.map(group => ({
          ...group,
          tasks: group.tasks?.map(task => 
            task.id === id ? { ...task, content } : task
          ) || []
        })) || []
      })) || []
    }));
  }

  function toggleTaskComplete(id: Id) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        tasks: col.tasks?.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        ) || [],
        groups: col.groups?.map(group => ({
          ...group,
          tasks: group.tasks?.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
          ) || []
        })) || []
      })) || []
    }));
  }

  function toggleGroupComplete(id: string) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        groups: col.groups?.map(group => {
          if (group.id === id) {
            // Toggle all tasks in the group
            const allCompleted = group.tasks?.every(task => task.completed);
            return {
              ...group,
              tasks: group.tasks?.map(task => ({ ...task, completed: !allCompleted })) || []
            };
          }
          return group;
        }) || []
      })) || []
    }));
  }

  function updateGroup(id: string, title: string) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        groups: col.groups?.map(group => 
          group.id === id ? { ...group, title } : group
        ) || []
      })) || []
    }));
  }

  function deleteGroup(id: string) {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => ({
        ...col,
        groups: col.groups?.filter(group => group.id !== id) || []
      })) || []
    }));
  }

  function convertTaskToHeading(id: Id, content: string): boolean {
    const { headingTitle, tasks } = parseHeadingAndTasks(content);
    
    if (!headingTitle) return false;

    // Find which column contains this task
    let targetColumnId: Id | null = null;
    let isInGroup = false;
    
    for (const col of board.columns || []) {
      if (col.tasks?.some(task => task.id === id)) {
        targetColumnId = col.id;
        break;
      }
      if (col.groups?.some(group => group.tasks?.some(task => task.id === id))) {
        targetColumnId = col.id;
        isInGroup = true;
        break;
      }
    }
    
    if (!targetColumnId) return false;

    // Create new group with tasks
    const newGroup = {
      id: generateId().toString(),
      title: headingTitle,
      tasks: tasks.map(taskContent => ({
        id: generateId(),
        content: taskContent,
        completed: false,
        tags: []
      }))
    };

    setBoard(prev => ({
      ...prev,
      columns: prev.columns?.map(col => {
        if (col.id !== targetColumnId) return col;
        
        return {
          ...col,
          tasks: col.tasks?.filter(task => task.id !== id) || [],
          groups: [...(col.groups || []), newGroup]
        };
      }) || []
    }));

    return true;
  }

  function createNewColumn() {
    const newColumn: Column = {
      id: generateId(),
      title: `Column ${generateId()}`,
      tasks: [],
      groups: []
    };

    setBoard(prev => ({
      ...prev,
      columns: [...(prev.columns || []), newColumn]
    }));
  }

  function deleteColumn(id: Id) {
    // Find the column to delete and its index
    const columnToDelete = board.columns?.find(col => col.id === id);
    const columnIndex = board.columns?.findIndex(col => col.id === id) ?? -1;
    
    if (columnToDelete && columnIndex !== -1) {
      // Store undo action
      addUndoAction({
        type: 'DELETE_COLUMN',
        data: {
          column: columnToDelete,
          index: columnIndex
        },
        timestamp: Date.now()
      });
    }

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
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

function parseHeadingAndTasks(content: string): { headingTitle?: string; tasks: string[] } {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) {
    return { tasks: [] };
  }
  
  // Check if first line is a heading
  const firstLine = lines[0];
  if (firstLine.startsWith('#')) {
    const headingTitle = firstLine.replace(/^#+\s*/, '');
    const tasks = lines.slice(1).map(line => {
      // Remove markdown list markers
      return line.replace(/^[-*+]\s*/, '');
    });
    
    return { headingTitle, tasks };
  }
  
  // If no heading, treat all lines as tasks
  const tasks = lines.map(line => {
    return line.replace(/^[-*+]\s*/, '');
  });
  
  return { tasks };
}

export default KanbanBoard;