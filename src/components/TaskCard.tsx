import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { renderContentWithTags } from "../utils/tags";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  toggleTaskComplete: (id: Id) => void;
  convertTaskToHeading?: (id: Id, content: string) => boolean;
  focusedTaskId: Id | null;
  setFocusedTaskId: (id: Id | null) => void;
  onTagClick?: (tag: string) => void;
}

function TaskCard({ task, deleteTask, updateTask, toggleTaskComplete, convertTaskToHeading, focusedTaskId, setFocusedTaskId, onTagClick }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(task.content === "");
  const [originalContent, setOriginalContent] = useState(task.content);

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
      if (!editMode) {
        // Entering edit mode - save original content
        setOriginalContent(task.content);
      } else {
        // Exiting edit mode - check for heading conversion
        if (convertTaskToHeading && convertTaskToHeading(task.id, task.content)) {
          // Task was converted to heading, don't change edit mode
          return;
        }
      }
      setEditMode((prev) => !prev);
      setMouseIsOver(false);
    }
  };

  const cancelEdit = () => {
    // Restore original content and exit edit mode
    updateTask(task.id, originalContent);
    setEditMode(false);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="opacity-30 h-[100px] min-h-[100px] border-2 border-primary cursor-grab"
      >
        <CardContent className="p-2.5 h-full" />
      </Card>
    );
  }

  if (editMode) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="h-[100px] min-h-[100px] cursor-grab transition-all duration-200"
      >
        <CardContent className="p-2.5 h-full">
          <Textarea
            className="h-[90%] w-full resize-none border-none bg-transparent focus:ring-0 focus:ring-offset-0"
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
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  // Allow Shift+Enter for line breaks (don't prevent default)
                  return;
                } else {
                  // Save on Enter without Shift
                  e.preventDefault();
                  toggleEditMode();
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            onChange={(e) => updateTask(task.id, e.target.value)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card
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
        className={cn(
          "group h-[100px] min-h-[100px] cursor-grab transition-all duration-200",
          "hover:shadow-md hover:ring-2 hover:ring-primary/20",
          focusedTaskId === task.id && "ring-2 ring-primary",
          task.completed && "opacity-75"
        )}
        onMouseEnter={() => setMouseIsOver(true)}
        onMouseLeave={() => setMouseIsOver(false)}
        onFocus={() => setFocusedTaskId(task.id)}
      >
        <CardContent className="p-2.5 h-full flex items-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-6 w-6 shrink-0 hover:bg-accent mt-1"
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
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {task.completed ? "Mark as incomplete" : "Mark as complete"}
            </TooltipContent>
          </Tooltip>

          <div className="flex-1 flex flex-col gap-1">
            <div className={cn(
              "overflow-y-auto overflow-x-hidden whitespace-pre-wrap text-sm",
              task.completed && "line-through text-muted-foreground"
            )}>
              {onTagClick ? (() => {
                const { content, tags } = renderContentWithTags(task.content, onTagClick);
                return (
                  <>
                    <div>{content}</div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags}
                      </div>
                    )}
                  </>
                );
              })() : task.content}
            </div>
          </div>

          {mouseIsOver && (
            <DeleteConfirmationDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TrashIcon />
                </Button>
              }
              title="Delete Task"
              description="Are you sure you want to delete this task? This action cannot be undone."
              onConfirm={() => deleteTask(task.id)}
            />
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default TaskCard;
