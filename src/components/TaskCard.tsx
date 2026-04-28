"use client";

import { useState, useEffect } from "react";
import { Task } from "@prisma/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Edit2 } from "lucide-react";

interface Props {
  task: Task;
  isOverlay?: boolean;
  onDelete?: (taskId: string, columnId: string) => void;
  onUpdate?: (taskId: string, columnId: string, title: string) => void;
}

export default function TaskCard({ task, isOverlay, onDelete, onUpdate }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [localTitle, setLocalTitle] = useState(task.title);
  
  useEffect(() => {
    setLocalTitle(task.title);
  }, [task.title]);

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
        className="opacity-30 bg-indigo-500/20 border-2 border-indigo-500/50 rounded-xl p-4 h-[100px] w-full"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass rounded-xl p-4 w-full group cursor-grab hover:ring-2 hover:ring-indigo-500/50 transition-all ${
        isOverlay ? "scale-105 shadow-2xl rotate-2" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        {!editMode ? (
          <h4 className="font-medium text-white text-sm flex-1 truncate mr-2">
            {task.title}
          </h4>
        ) : (
          <input
            className="bg-black/30 border border-indigo-500/50 rounded px-2 py-1 outline-none text-white text-sm w-full mr-2"
            value={localTitle}
            autoFocus
            onBlur={() => {
              setEditMode(false);
              if (localTitle.trim() && localTitle !== task.title && onUpdate) {
                onUpdate(task.id, task.columnId, localTitle);
              }
            }}
            onChange={(e) => setLocalTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditMode(false);
                if (localTitle.trim() && localTitle !== task.title && onUpdate) {
                  onUpdate(task.id, task.columnId, localTitle);
                }
              } else if (e.key === "Escape") {
                setEditMode(false);
                setLocalTitle(task.title);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        )}
        {!editMode && (
          <div className="flex items-center z-10 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
            <button className="text-gray-400 hover:text-white transition-colors p-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(true);
              }}>
              <Edit2 size={14} />
            </button>
            <button className="text-gray-400 hover:text-red-400 transition-colors p-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(task.id, task.columnId);
              }}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
          {task.description}
        </p>
      )}
    </div>
  );
}
