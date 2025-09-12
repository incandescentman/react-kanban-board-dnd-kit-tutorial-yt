import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Column, Id, Task, Group } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, useEffect, useRef } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
import GroupContainer from "./GroupContainer";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Palette } from 'lucide-react';
import { 
  IconSparkles,
  IconChecklist,
  IconRun,
  IconCircleCheck,
  IconFolder
} from '@tabler/icons-react';

interface Props {
  column: Column;
  updateColumn: (id: Id, updates: Partial<Column>) => void;

  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  toggleTaskComplete: (id: Id) => void;
  duplicateTask?: (id: Id) => void;
  toggleGroupComplete?: (id: Id) => void;
  updateGroup?: (id: string, title: string) => void;
  deleteGroup?: (id: string) => void;
  convertTaskToHeading?: (id: Id, content: string) => boolean;
  tasks: Task[];
  focusedTaskId: Id | null;
  setFocusedTaskId: (id: Id | null) => void;
  columnMoveMode?: boolean;
  onTagClick?: (tag: string) => void;
  selectMode?: boolean;
  selectedTaskIds?: Set<Id>;
  onSelectToggle?: (id: Id) => void;
}

function ColumnContainer({
  column,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
  toggleTaskComplete,
  duplicateTask,
  toggleGroupComplete,
  updateGroup,
  deleteGroup,
  convertTaskToHeading,
  focusedTaskId,
  setFocusedTaskId,
  columnMoveMode,
  onTagClick,
  selectMode,
  selectedTaskIds,
  onSelectToggle,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }
  }, [showColorPicker]);

  const tasksIds = useMemo(() => {
    // Only include direct tasks in column, not group tasks
    return tasks?.map((task) => task.id) || [];
  }, [tasks]);

  const getColumnIcon = () => {
    const title = column.title.toLowerCase();
    if (title.includes('idea')) return <IconSparkles size={28} className="text-purple-600" />;
    if (title.includes('todo') || title.includes('to do')) return <IconChecklist size={28} className="text-blue-600" />;
    if (title.includes('progress') || title.includes('doing')) return <IconRun size={28} className="text-orange-600" />;
    if (title.includes('done') || title.includes('complete')) return <IconCircleCheck size={28} className="text-green-600" />;
    return <IconFolder size={28} className="text-gray-600" />;
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

  // Highlight column area when a task is dragged over
  const { isOver: isOverColumnArea, setNodeRef: setAreaRef } = useDroppable({
    id: `${column.id}-area`,
    data: { type: 'ColumnArea', columnId: column.id },
  });

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
        className={`
      ${column.color ? column.color : 'bg-mainBackgroundColor'}
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
      `}
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
              onChange={(e) => updateColumn(column.id, { title: e.target.value })}
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
        <div className="relative flex items-center gap-1">
          {/* Color picker trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker((v) => !v);
                }}
              >
                <Palette className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Column color</TooltipContent>
          </Tooltip>
          {showColorPicker && (
            <div ref={pickerRef} className="absolute right-10 top-1 z-20 bg-white p-2 rounded-md shadow-md border grid grid-cols-5 gap-2">
              {[
                'bg-white',
                'bg-blue-50','bg-green-50','bg-yellow-50','bg-purple-50','bg-pink-50',
                'bg-orange-50','bg-cyan-50','bg-teal-50','bg-red-50','bg-gray-100',
              ].map((cls) => (
                <button
                  key={cls}
                  className={`${cls} h-6 w-6 rounded border border-gray-300 hover:opacity-80`}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateColumn(column.id, { color: cls });
                    setShowColorPicker(false);
                  }}
                />
              ))}
              <button
                className="col-span-5 text-xs text-gray-600 hover:text-gray-900 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  updateColumn(column.id, { color: undefined });
                  setShowColorPicker(false);
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Column task container */}
      <div 
        ref={setAreaRef}
        className={`flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto cursor-pointer ${isOverColumnArea ? 'ring-2 ring-blue-300 bg-blue-50/40' : ''}`}
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
              duplicateTask={duplicateTask}
              selectMode={selectMode}
              selectedTaskIds={selectedTaskIds}
              onSelectToggle={onSelectToggle}
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
              duplicateTask={duplicateTask}
              selectMode={selectMode}
              selected={selectedTaskIds?.has(task.id)}
              onSelectToggle={onSelectToggle}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default ColumnContainer;
