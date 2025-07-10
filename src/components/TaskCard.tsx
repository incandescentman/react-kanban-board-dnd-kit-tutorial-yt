import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import SquareCheckIcon from "../icons/SquareCheckIcon";
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
      <p className={`my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap ${task.completed ? 'line-through text-gray-500' : ''}`}>
        {task.content}
      </p>

      {mouseIsOver && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskComplete(task.id);
            }}
            className="stroke-black bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100 hover:bg-green-200 hover:stroke-green-700 transition-all duration-150"
          >
            <SquareCheckIcon />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="stroke-black bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100 hover:bg-red-200 hover:stroke-red-700 transition-all duration-150"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
