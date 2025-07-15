import { useState } from "react";

interface Props {
  intentions: string[];
  setIntentions: (intentions: string[]) => void;
}

function IntentionsPanel({ intentions, setIntentions }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingFooter, setEditingFooter] = useState(false);
  const [footerText, setFooterText] = useState("Stay focused! 💫");

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(intentions[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const newIntentions = [...intentions];
      
      // If the text is empty, remove the intention instead of saving it
      if (editingText.trim() === "") {
        newIntentions.splice(editingIndex, 1);
      } else {
        newIntentions[editingIndex] = editingText.trim();
      }
      
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
    setIntentions([...intentions, ""]);
    setEditingIndex(intentions.length);
    setEditingText("");
  };

  const handleFooterEdit = () => {
    setEditingFooter(true);
  };

  const handleFooterSave = () => {
    setEditingFooter(false);
  };

  return (
    <div className="w-64 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <h3 className="text-base font-bold text-blue-900">
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

      {/* Add Area */}
      <div
        onClick={handleAdd}
        className="w-full py-3 cursor-pointer group flex items-center justify-center"
      >
        <span className="text-blue-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          +
        </span>
      </div>

      {/* Cute Footer */}
      <div className="mt-4 text-center">
        {editingFooter ? (
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="text-xs text-blue-600/70 bg-transparent border-none outline-none text-center w-full placeholder-blue-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFooterSave();
              } else if (e.key === 'Escape') {
                setEditingFooter(false);
              }
            }}
            onBlur={handleFooterSave}
            autoFocus
          />
        ) : (
          <span 
            className="text-xs text-blue-600/70 cursor-pointer hover:text-blue-600"
            onClick={handleFooterEdit}
          >
            {footerText}
          </span>
        )}
      </div>
    </div>
  );
}

export default IntentionsPanel;