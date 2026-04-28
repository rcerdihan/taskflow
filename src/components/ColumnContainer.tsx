"use client";

import { useMemo, useState, useEffect } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { BoardColumn } from "./KanbanBoard";
import TaskCard from "./TaskCard";

interface Props {
  column: BoardColumn;
  isOverlay?: boolean;
  onTaskAdd?: (columnId: string, title: string) => void;
  onTaskDelete?: (taskId: string, columnId: string) => void;
  onTaskUpdate?: (taskId: string, columnId: string, title: string) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnUpdate?: (columnId: string, title: string) => void;
}

export default function ColumnContainer({ 
  column, 
  isOverlay, 
  onTaskAdd,
  onTaskDelete,
  onTaskUpdate,
  onColumnDelete,
  onColumnUpdate
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [localTitle, setLocalTitle] = useState(column.title);

  useEffect(() => {
    setLocalTitle(column.title);
  }, [column.title]);

  const tasksIds = useMemo(() => {
    return column.tasks.map((t) => t.id);
  }, [column.tasks]);

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
        className="opacity-40 bg-indigo-500/10 border-2 border-indigo-500/50 rounded-2xl w-[320px] h-[500px] flex-shrink-0"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-column rounded-2xl w-[320px] max-h-full flex flex-col flex-shrink-0 shadow-xl ${
        isOverlay ? "scale-105 shadow-2xl rotate-1" : ""
      }`}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="p-4 flex items-center justify-between border-b border-white/5 cursor-grab bg-white/5 rounded-t-2xl hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
            {column.tasks.length}
          </div>
          {!editMode ? (
            <h3 className="font-semibold text-white tracking-wide text-sm truncate max-w-[200px]">
              {column.title}
            </h3>
          ) : (
            <input
              className="bg-black/30 border border-indigo-500/50 rounded px-2 py-1 outline-none text-white text-sm w-full"
              value={localTitle}
              autoFocus
              onBlur={() => {
                setEditMode(false);
                if (localTitle.trim() && localTitle !== column.title && onColumnUpdate) {
                  onColumnUpdate(column.id, localTitle);
                }
              }}
              onChange={(e) => setLocalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditMode(false);
                  if (localTitle.trim() && localTitle !== column.title && onColumnUpdate) {
                    onColumnUpdate(column.id, localTitle);
                  }
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
        {!editMode && (
          <div className="flex items-center shrink-0">
            <button 
              className="text-gray-400 hover:text-white transition-colors p-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(true);
              }}
            >
              <Edit2 size={14} />
            </button>
            <button 
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onColumnDelete) onColumnDelete(column.id);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Column Body - Task List */}
      <div className="p-3 flex flex-col gap-3 flex-grow overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={onTaskDelete}
              onUpdate={onTaskUpdate}
            />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <div className="p-3 border-t border-white/5 mt-auto">
        {!addingTask ? (
          <button 
            onClick={() => setAddingTask(true)}
            className="flex items-center gap-2 w-full p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
          >
            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
              <Plus size={14} />
            </div>
            <span>Add Task</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              className="bg-black/30 border border-indigo-500/50 rounded-xl px-3 py-2 outline-none text-white text-sm w-full resize-none h-20"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              autoFocus
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (newTaskTitle.trim() && onTaskAdd) {
                    onTaskAdd(column.id, newTaskTitle);
                    setNewTaskTitle("");
                    setAddingTask(false);
                  }
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (newTaskTitle.trim() && onTaskAdd) {
                    onTaskAdd(column.id, newTaskTitle);
                  }
                  setNewTaskTitle("");
                  setAddingTask(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Add
              </button>
              <button 
                onClick={() => {
                  setNewTaskTitle("");
                  setAddingTask(false);
                }}
                className="text-gray-400 hover:text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
