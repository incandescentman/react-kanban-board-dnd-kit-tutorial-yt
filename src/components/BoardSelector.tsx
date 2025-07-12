import { useState } from "react";

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
  minimized: boolean;
  onMinimize: () => void;
}

function BoardSelector({ currentBoard, currentBoardTitle, availableBoards, onBoardChange, onBoardDelete, minimized, onMinimize }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

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
      // If editing the current board, switch to the new title
      if (editingBoard === currentBoard) {
        onBoardChange(editingTitle.trim());
      }
      setEditingBoard(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingBoard(null);
    setEditingTitle("");
  };

  return (
    <div className="w-64 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h3 className="text-lg font-bold text-purple-900" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
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
      <div className="space-y-2 mb-4">
        {availableBoards.map((board) => (
          <div
            key={board.name}
            className={`w-full p-3 rounded-xl text-sm font-medium transition-all border group ${
              currentBoard === board.name
                ? 'bg-purple-200 border-purple-300 text-purple-900 shadow-sm'
                : 'bg-white/70 border-purple-200 text-purple-700 hover:bg-white/90 hover:border-purple-300'
            }`}
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
        ))}
      </div>

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