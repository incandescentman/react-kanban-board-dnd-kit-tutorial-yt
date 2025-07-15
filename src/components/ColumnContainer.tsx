import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task, Group } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
import GroupContainer from "./GroupContainer";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  toggleTaskComplete: (id: Id) => void;
  toggleGroupComplete?: (id: Id) => void;
  updateGroup?: (id: string, title: string) => void;
  deleteGroup?: (id: string) => void;
  convertTaskToHeading?: (id: Id, content: string) => boolean;
  tasks: Task[];
  focusedTaskId: Id | null;
  setFocusedTaskId: (id: Id | null) => void;
  columnMoveMode?: boolean;
  onTagClick?: (tag: string) => void;
}

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
  toggleTaskComplete,
  toggleGroupComplete,
  updateGroup,
  deleteGroup,
  convertTaskToHeading,
  focusedTaskId,
  setFocusedTaskId,
  columnMoveMode,
  onTagClick,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    // Only include direct tasks in column, not group tasks
    return tasks?.map((task) => task.id) || [];
  }, [tasks]);

  const getColumnIcon = () => {
    const title = column.title.toLowerCase();
    if (title.includes('idea')) return <span className="text-3xl">🧠</span>;
    if (title.includes('todo') || title.includes('to do')) return <span className="text-3xl">📝</span>;
    if (title.includes('progress') || title.includes('doing')) return <span className="text-3xl">🏃🏻‍♂️</span>;
    if (title.includes('done') || title.includes('complete')) return <span className="text-3xl">✅</span>;
    return null;
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode || !columnMoveMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
      bg-columnBackgroundColor
      opacity-40
      border-2
      border-pink-500
      w-[350px]
      h-[90vh]
      max-h-[90vh]
      rounded-md
      flex
      flex-col
      "
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
  bg-columnBackgroundColor
  w-[350px]
  h-[90vh]
  max-h-[90vh]
  rounded-md
  flex
  flex-col
  "
    >
      {/* Column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="
      bg-mainBackgroundColor
      text-3xl
      h-[60px]
      cursor-grab
      rounded-md
      rounded-b-none
      p-3
      font-bold
      border-columnBackgroundColor
      border-4
      flex
      items-center
      justify-between
      "
      >
        <div className="flex gap-2 items-center">
          {getColumnIcon()}
          {!editMode && column.title}
          <div
            className="
        flex
        justify-center
        items-center
        bg-columnBackgroundColor
        px-2
        py-1
        text-sm
        rounded-full
        "
          >
{((tasks?.length || 0) + (column.groups?.reduce((acc, group) => acc + (group.tasks?.length || 0), 0) || 0))}
          </div>
          {editMode && (
            <input
              className="bg-white focus:border-blue-500 border border-gray-300 rounded outline-none px-2 text-black"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditMode(false);
                } else if (e.key === "Escape") {
                  setEditMode(false);
                }
              }}
            />
          )}
        </div>
        
        {!editMode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group">
                <DeleteConfirmationDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 hover:opacity-100 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  }
                  title="Delete Column"
                  description={`Are you sure you want to delete the "${column.title}" column? This will permanently delete the column and all its tasks.`}
                  onConfirm={() => deleteColumn(column.id)}
                  confirmText="Delete Column"
                />
                <TooltipContent side="bottom">
                  Delete column
                </TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
        )}
      </div>

      {/* Column task container */}
      <div 
        className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto cursor-pointer"
        onClick={() => createTask(column.id)}
      >
        <SortableContext items={tasksIds}>
          {/* Render groups first */}
          {column.groups?.map((group) => (
            <GroupContainer
              key={group.id}
              group={group}
              updateTask={updateTask}
              deleteTask={deleteTask}
              toggleTaskComplete={toggleTaskComplete}
              toggleGroupComplete={toggleGroupComplete}
              updateGroup={updateGroup}
              deleteGroup={deleteGroup}
              convertTaskToHeading={convertTaskToHeading}
              focusedTaskId={focusedTaskId}
              setFocusedTaskId={setFocusedTaskId}
              onTagClick={onTagClick}
            />
          ))}
          
          {/* Then render tasks directly in the column */}
          {tasks?.map((task) => (
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

export default ColumnContainer;
