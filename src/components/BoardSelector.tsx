import { useState } from "react";

interface Props {
  currentBoard: string;
  onBoardChange: (boardName: string) => void;
}

function BoardSelector({ currentBoard, onBoardChange }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  // Mock board list - in the future this could come from localStorage or API
  const boards = [
    "Rising Action Board",
    "Personal Goals",
    "Work Projects",
    "Side Hustles"
  ];

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onBoardChange(newBoardName.trim());
      setNewBoardName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-bold text-purple-900" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
          Boards
        </h3>
      </div>

      {/* Board List */}
      <div className="space-y-2 mb-4">
        {boards.map((board) => (
          <button
            key={board}
            onClick={() => onBoardChange(board)}
            className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all border ${
              currentBoard === board
                ? 'bg-purple-200 border-purple-300 text-purple-900 shadow-sm'
                : 'bg-white/70 border-purple-200 text-purple-700 hover:bg-white/90 hover:border-purple-300'
            }`}
          >
            {board}
          </button>
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