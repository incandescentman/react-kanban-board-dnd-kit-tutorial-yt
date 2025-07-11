import { useState, useEffect, useRef } from "react";

interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
  shortcut?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

function CommandPalette({ isOpen, onClose, commands }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchTerm("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[20vh] z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-gray-300">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-lg bg-transparent outline-none text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No commands found
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`p-3 flex items-center justify-between cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  command.action();
                  onClose();
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{command.label}</div>
                  <div className="text-sm text-gray-500">{command.description}</div>
                </div>
                {command.shortcut && (
                  <div className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {command.shortcut}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
          <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
          <span>Cmd+K to open</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;