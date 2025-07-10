import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  toggleTaskComplete: (id: Id) => void;
  focusedTaskId: Id | null;
  setFocusedTaskId: (id: Id | null) => void;
}

function TaskCard({ task, deleteTask, updateTask, toggleTaskComplete, focusedTaskId, setFocusedTaskId }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(task.content === "");

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    if (editMode && task.content.trim() === "") {
      deleteTask(task.id);
    } else {
      setEditMode((prev) => !prev);
      setMouseIsOver(false);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
        opacity-30
      bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-blue-500  cursor-grab relative text-black
      "
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-blue-500 cursor-grab relative border border-gray-200"
      >
        <textarea
          className="
        h-[90%]
        w-full resize-none border-none rounded bg-transparent text-black focus:outline-none
        "
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => {
            const textarea = e.target as HTMLTextAreaElement;
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              toggleEditMode();
            }
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        toggleEditMode();
      }}
      data-task-id={task.id}
      tabIndex={0}
      className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-blue-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 cursor-grab relative task border border-gray-200"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      onFocus={() => {
        setFocusedTaskId(task.id);
      }}
    >
      <div className="flex items-start gap-3 my-auto h-[90%] w-full">
        <div 
          className="flex-shrink-0 mt-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
        >
          {task.completed ? (
            <div className="w-4 h-4 border border-gray-400 rounded bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors duration-150">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-4 h-4 border border-gray-400 rounded bg-white hover:bg-gray-100 hover:border-gray-500 transition-colors duration-150"></div>
          )}
        </div>
        <p className={`overflow-y-auto overflow-x-hidden whitespace-pre-wrap flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.content}
        </p>
      </div>

      {mouseIsOver && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="stroke-black absolute right-4 top-2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
