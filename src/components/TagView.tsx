import { Task, Id } from "../types";
import { getTagColor } from "../utils/tags";

interface TaskWithLocation extends Task {
  columnId: Id;
  columnTitle: string;
  groupTitle?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tag: string;
  tasks: TaskWithLocation[];
  onTaskClick?: (taskId: Id) => void;
}

function TagView({ isOpen, onClose, tag, tasks, onTaskClick }: Props) {
  if (!isOpen) return null;

  const colors = getTagColor(tag);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {tag}
              </span>
              <h2 className="text-2xl font-bold text-gray-800">
                {tasks.length} {tasks.length === 1 ? 'card' : 'cards'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No cards found with tag {tag}
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                    onTaskClick ? 'cursor-pointer' : ''
                  } ${task.completed ? 'opacity-60' : ''}`}
                  onClick={() => onTaskClick && onTaskClick(task.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {task.completed && (
                          <div className="w-4 h-4 border border-gray-400 rounded bg-green-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.content}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{task.columnTitle}</span>
                        {task.groupTitle && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{task.groupTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between">
          <span>Click on a card to navigate to it</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}

export default TagView;