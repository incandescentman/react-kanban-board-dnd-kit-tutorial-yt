import { useState } from "react";
import { IconLayoutKanban } from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

interface Board {
  name: string;
  title: string;
}

interface Props {
  currentBoard: string;
  currentBoardTitle: string;
  availableBoards: Board[];
  onBoardChange: (boardName: string) => void;
  onBoardDelete: (boardName: string) => void;
  onBoardReorder: (reorderedBoards: Board[]) => void;
  onBoardUpdateTitle: (boardName: string, newTitle: string) => void;
  minimized: boolean;
  onMinimize: () => void;
}

// Sortable Board Item Component
function SortableBoardItem({ 
  board, 
  currentBoard, 
  editingBoard, 
  editingTitle, 
  setEditingTitle, 
  onBoardChange, 
  onBoardDelete, 
  handleEditBoard, 
  handleSaveEdit, 
  handleCancelEdit 
}: {
  board: Board;
  currentBoard: string;
  editingBoard: string | null;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  onBoardChange: (boardName: string) => void;
  onBoardDelete: (boardName: string) => void;
  handleEditBoard: (boardName: string, boardTitle: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`w-full p-3 rounded-xl text-sm font-medium transition-all border group cursor-grab active:cursor-grabbing ${
        currentBoard === board.name
          ? 'bg-purple-200 border-purple-300 text-purple-900 shadow-sm'
          : 'bg-white/70 border-purple-200 text-purple-700 hover:bg-white/90 hover:border-purple-300'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {editingBoard === board.name ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="w-full text-sm border border-purple-300 rounded-lg px-2 py-1 bg-white text-purple-900 focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            onBlur={handleSaveEdit}
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div {...listeners} className="text-purple-400 cursor-grab active:cursor-grabbing text-xs">
              ⋮⋮
            </div>
            <button
              onClick={() => onBoardChange(board.name)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleEditBoard(board.name, board.title);
              }}
              className="flex-1 text-left"
            >
              {board.title}
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBoardDelete(board.name);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-xs ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function BoardSelector({ currentBoard, currentBoardTitle, availableBoards, onBoardChange, onBoardDelete, onBoardReorder, onBoardUpdateTitle, minimized, onMinimize }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onBoardChange(newBoardName.trim());
      setNewBoardName("");
      setIsCreating(false);
    }
  };

  const handleEditBoard = (boardName: string, boardTitle: string) => {
    setEditingBoard(boardName);
    setEditingTitle(boardTitle);
  };

  const handleSaveEdit = () => {
    if (editingBoard && editingTitle.trim()) {
      onBoardUpdateTitle(editingBoard, editingTitle.trim());
      setEditingBoard(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingBoard(null);
    setEditingTitle("");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const board = availableBoards.find(b => b.name === event.active.id);
    setActiveBoard(board || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = availableBoards.findIndex(board => board.name === active.id);
      const newIndex = availableBoards.findIndex(board => board.name === over?.id);
      
      const reorderedBoards = arrayMove(availableBoards, oldIndex, newIndex);
      onBoardReorder(reorderedBoards);
    }
    
    setActiveBoard(null);
  };

  return (
    <div className="w-64 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconLayoutKanban size={24} className="text-purple-700" />
          <h3 className="text-lg font-bold text-purple-900">
            Boards
          </h3>
        </div>
        <button
          onClick={onMinimize}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
        >
          −
        </button>
      </div>

      {/* Board List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2 mb-4">
          <SortableContext
            items={availableBoards.map(board => board.name)}
            strategy={verticalListSortingStrategy}
          >
            {availableBoards.map((board) => (
              <SortableBoardItem
                key={board.name}
                board={board}
                currentBoard={currentBoard}
                editingBoard={editingBoard}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                onBoardChange={onBoardChange}
                onBoardDelete={onBoardDelete}
                handleEditBoard={handleEditBoard}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
              />
            ))}
          </SortableContext>
        </div>
        
        {createPortal(
          <DragOverlay>
            {activeBoard && (
              <div className="w-64 p-3 rounded-xl text-sm font-medium bg-purple-200 border-purple-300 text-purple-900 shadow-lg rotate-3">
                {activeBoard.title}
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Create New Board */}
      {isCreating ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Board name..."
            className="w-full p-2 text-sm border border-purple-300 rounded-xl bg-white/90 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateBoard();
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewBoardName("");
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateBoard}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewBoardName("");
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsCreating(true)}
          className="w-full py-3 cursor-pointer group flex items-center justify-center"
        >
          <span className="text-purple-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            +
          </span>
        </div>
      )}

      {/* Cute Footer */}
      <div className="mt-4 text-center">
        <span className="text-xs text-purple-600/70">Stay organized! ✨</span>
      </div>
    </div>
  );
}

export default BoardSelector;