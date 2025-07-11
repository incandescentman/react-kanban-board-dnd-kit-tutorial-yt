import { useState } from "react";

interface Props {
  intentions: string[];
  setIntentions: (intentions: string[]) => void;
}

function IntentionsPanel({ intentions, setIntentions }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(intentions[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const newIntentions = [...intentions];
      newIntentions[editingIndex] = editingText;
      setIntentions(newIntentions);
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const handleDelete = (index: number) => {
    const newIntentions = intentions.filter((_, i) => i !== index);
    setIntentions(newIntentions);
  };

  const handleAdd = () => {
    setIntentions([...intentions, "New intention"]);
    setEditingIndex(intentions.length);
    setEditingText("New intention");
  };

  return (
    <div className="w-64 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <h3 className="text-base font-bold text-blue-900" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
          Current Intentions
        </h3>
      </div>

      {/* Intentions List */}
      <div className="space-y-1.5 mb-3">
        {intentions.map((intention, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-2.5 hover:bg-white/90 transition-colors group"
          >
            {editingIndex === index ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full text-sm text-blue-900 bg-transparent border-none outline-none placeholder-blue-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    } else if (e.key === 'Escape') {
                      setEditingIndex(null);
                      setEditingText("");
                    }
                  }}
                  onBlur={handleSave}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm text-blue-900 cursor-pointer flex-1"
                  onClick={() => handleEdit(index)}
                >
                  {intention}
                </span>
                <button
                  onClick={() => handleDelete(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-xs ml-2"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        className="w-full bg-blue-200 hover:bg-blue-300 text-blue-900 text-sm font-medium py-2 px-3 rounded-xl transition-colors border border-blue-300 hover:border-blue-400"
      >
        + Add Intention
      </button>

      {/* Cute Footer */}
      <div className="mt-4 text-center">
        <span className="text-xs text-blue-600/70">Stay focused! 💫</span>
      </div>
    </div>
  );
}

export default IntentionsPanel;