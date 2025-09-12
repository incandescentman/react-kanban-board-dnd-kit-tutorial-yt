import { useState } from "react";
import { 
  IconFocus, 
  IconHeart,
  IconTarget,
  IconBulb,
  IconCheckbox,
  IconSparkles,
  IconFlag,
  IconStar,
  IconBolt,
  IconActivity
} from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Intention Item Component
function SortableIntentionItem({
  intention,
  index,
  isLast,
  onEdit,
  onDelete,
  editingIndex,
  editingText,
  setEditingText,
  handleSave,
  setEditingIndex
}: {
  intention: string;
  index: number;
  isLast: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  editingIndex: number | null;
  editingText: string;
  setEditingText: (text: string) => void;
  handleSave: () => void;
  setEditingIndex: (index: number | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `intention-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Choose icon based on index or content
  const getIcon = () => {
    const icons = [
      <IconTarget size={16} className="text-blue-900" />,
      <IconHeart size={16} className="text-blue-900" />,
      <IconBulb size={16} className="text-blue-900" />,
      <IconCheckbox size={16} className="text-blue-900" />,
      <IconSparkles size={16} className="text-blue-900" />,
      <IconFlag size={16} className="text-blue-900" />,
      <IconStar size={16} className="text-blue-900" />,
      <IconBolt size={16} className="text-blue-900" />,
      <IconActivity size={16} className="text-blue-900" />
    ];
    return icons[index % icons.length];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex gap-3 group"
    >
      {/* Icon with timeline */}
      <div className="relative flex flex-col items-center">
        <div 
          className="w-7 h-7 flex items-center justify-center shrink-0 rounded-full bg-white border border-blue-900 p-1 z-10 cursor-move"
          {...attributes}
          {...listeners}
        >
          {getIcon()}
        </div>
        {!isLast && (
          <div className="w-px h-full bg-gray-300 absolute top-7" />
        )}
      </div>
      
      {/* Text content */}
      <div className="flex-1 pb-4">
        {editingIndex === index ? (
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="w-full text-base text-blue-900 bg-white/70 border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
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
        ) : (
          <div className="flex items-center justify-between">
            <span 
              className="text-base text-blue-900 leading-6 cursor-pointer flex-1"
              onDoubleClick={() => onEdit(index)}
            >
              {intention}
            </span>
            <button
              onClick={() => onDelete(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-sm ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  intentions: string[];
  setIntentions: (intentions: string[]) => void;
}

function IntentionsPanel({ intentions, setIntentions }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingFooter, setEditingFooter] = useState(false);
  const [footerText, setFooterText] = useState("Stay focused!");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    setIntentions([...intentions, "New intention"]);
    setEditingIndex(intentions.length);
    setEditingText("New intention");
  };

  const handleFooterEdit = () => {
    setEditingFooter(true);
  };

  const handleFooterSave = () => {
    setEditingFooter(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id.toString().replace('intention-', ''));
      const newIndex = parseInt(over?.id.toString().replace('intention-', '') || '0');
      
      if (!isNaN(oldIndex) && !isNaN(newIndex)) {
        const newIntentions = arrayMove(intentions, oldIndex, newIndex);
        setIntentions(newIntentions);
      }
    }
  };

  return (
    <div className="w-72 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="mb-5 pb-3 border-b border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 text-center">
          Current Intentions
        </h3>
      </div>

      {/* Intentions List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={intentions.map((_, i) => `intention-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0">
            {intentions.map((intention, index) => (
              <SortableIntentionItem
                key={`intention-${index}`}
                intention={intention}
                index={index}
                isLast={index === intentions.length - 1}
                onEdit={handleEdit}
                onDelete={handleDelete}
                editingIndex={editingIndex}
                editingText={editingText}
                setEditingText={setEditingText}
                handleSave={handleSave}
                setEditingIndex={setEditingIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Area */}
      <div
        onClick={handleAdd}
        className="w-full py-3 cursor-pointer group flex items-center justify-center hover:bg-white/30 rounded-lg transition-colors"
      >
        <span className="text-blue-600 text-sm opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          + Add intention
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