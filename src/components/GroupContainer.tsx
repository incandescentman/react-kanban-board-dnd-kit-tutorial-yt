import { Group, Id, Task } from "../types";
import TaskCard from "./TaskCard";
import { useState, useMemo } from "react";
import TrashIcon from "../icons/TrashIcon";
import { SortableContext } from "@dnd-kit/sortable";

interface Props {
  group: Group;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  toggleTaskComplete: (id: Id) => void;
  toggleGroupComplete?: (id: Id) => void;
  updateGroup?: (id: string, title: string) => void;
  deleteGroup?: (id: string) => void;
  convertTaskToHeading?: (id: Id, content: string) => boolean;
  focusedTaskId: Id | null;
  setFocusedTaskId: (id: Id | null) => void;
  onTagClick?: (tag: string) => void;
}

function GroupContainer({
  group,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  toggleGroupComplete,
  updateGroup,
  deleteGroup,
  convertTaskToHeading,
  focusedTaskId,
  setFocusedTaskId,
  onTagClick,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [mouseIsOver, setMouseIsOver] = useState(false);

  const groupTasksIds = useMemo(() => {
    return group.tasks?.map((task) => task.id) || [];
  }, [group.tasks]);

  return (
    <div className="mb-4">
      {/* Group heading */}
      <div 
        className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors relative"
        onMouseEnter={() => setMouseIsOver(true)}
        onMouseLeave={() => setMouseIsOver(false)}
      >
        <div 
          className="flex-shrink-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (toggleGroupComplete) {
              toggleGroupComplete(group.id);
            }
          }}
        >
          {group.completed ? (
            <div className="w-4 h-4 border border-gray-400 rounded bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors duration-150">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-4 h-4 border border-gray-400 rounded bg-white hover:bg-gray-100 hover:border-gray-500 transition-colors duration-150"></div>
          )}
        </div>
        
        {editMode ? (
          <input
            className="text-lg font-semibold bg-white border border-blue-500 rounded px-2 py-1 outline-none text-gray-800 flex-1"
            value={group.title}
            onChange={(e) => updateGroup && updateGroup(group.id, e.target.value)}
            onBlur={() => setEditMode(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditMode(false);
              } else if (e.key === 'Escape') {
                setEditMode(false);
              }
            }}
            autoFocus
          />
        ) : (
          <h3 
            className={`text-lg font-semibold cursor-pointer flex-1 ${group.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(true);
            }}
          >
            {group.title}
          </h3>
        )}

        {mouseIsOver && !editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (deleteGroup) {
                deleteGroup(group.id);
              }
            }}
            className="stroke-gray-600 absolute right-2 top-2 bg-gray-200 p-1 rounded opacity-60 hover:opacity-100 hover:bg-red-100 hover:stroke-red-600 transition-colors"
          >
            <TrashIcon />
          </button>
        )}
      </div>
      
      {/* Group tasks */}
      <div className="ml-6 space-y-2">
        <SortableContext items={groupTasksIds}>
          {group.tasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              toggleTaskComplete={toggleTaskComplete}
              convertTaskToHeading={convertTaskToHeading}
              focusedTaskId={focusedTaskId}
              setFocusedTaskId={setFocusedTaskId}
              onTagClick={onTagClick}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default GroupContainer;