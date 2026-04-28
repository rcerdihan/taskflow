"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Column, Task } from "@prisma/client";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";

export type BoardColumn = Column & { tasks: Task[] };

export default function KanbanBoard({ boardId, initialColumns }: { boardId: string, initialColumns: BoardColumn[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const submitNewColumn = async () => {
    if (!newColumnTitle.trim()) {
      setAddingColumn(false);
      return;
    }
    const columnToAdd = {
      title: newColumnTitle.trim(),
      boardId: boardId,
      order: columns.length,
    };
    
    const res = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(columnToAdd),
    });
    
    if (res.ok) {
      const newCol = await res.json();
      setColumns((cols) => [...cols, newCol]);
    }
    setAddingColumn(false);
    setNewColumnTitle("");
  };

  const createTask = async (columnId: string, title: string) => {
    const colIndex = columns.findIndex(c => c.id === columnId);
    if (colIndex === -1) return;
    const order = columns[colIndex].tasks.length;
    
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, columnId, order }),
    });
    
    if (res.ok) {
      const newTask = await res.json();
      setColumns((cols) => {
        const newCols = [...cols];
        const i = newCols.findIndex(c => c.id === columnId);
        if (newCols[i].tasks.some(t => t.id === newTask.id)) return newCols;
        newCols[i] = {
          ...newCols[i],
          tasks: [...newCols[i].tasks, newTask]
        };
        return newCols;
      });
    }
  };

  const deleteTask = async (taskId: string, columnId: string) => {
    setColumns((cols) => {
      const newCols = [...cols];
      const colIndex = newCols.findIndex(c => c.id === columnId);
      newCols[colIndex] = {
        ...newCols[colIndex],
        tasks: newCols[colIndex].tasks.filter(t => t.id !== taskId)
      };
      return newCols;
    });
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  const updateTask = async (taskId: string, columnId: string, title: string) => {
    setColumns((cols) => {
      const newCols = [...cols];
      const colIndex = newCols.findIndex(c => c.id === columnId);
      newCols[colIndex] = {
        ...newCols[colIndex],
        tasks: newCols[colIndex].tasks.map(t => t.id === taskId ? { ...t, title } : t)
      };
      return newCols;
    });
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  };

  const deleteColumn = async (columnId: string) => {
    setColumns((cols) => cols.filter(c => c.id !== columnId));
    await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
  };

  const updateColumn = async (columnId: string, title: string) => {
    setColumns((cols) => cols.map(c => c.id === columnId ? { ...c, title } : c));
    await fetch(`/api/columns/${columnId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle Column Dragging
    const isActiveColumn = active.data.current?.type === "Column";
    if (isActiveColumn) {
      setColumns((columns) => {
        const activeIndex = columns.findIndex((col) => col.id === activeId);
        const overIndex = columns.findIndex((col) => col.id === overId);
        return arrayMove(columns, activeIndex, overIndex);
      });
      return;
    }

    const isActiveTask = active.data.current?.type === "Task";
    if (isActiveTask) {
       setColumns((columns) => {
        const activeIndex = columns.findIndex((c) => c.tasks.some((t) => t.id === activeId));
        const overIndex = columns.findIndex((c) => c.tasks.some((t) => t.id === overId) || c.id === overId);

        if (activeIndex === -1 || overIndex === -1) return columns;

        if (activeIndex === overIndex) {
          const activeTaskIndex = columns[activeIndex].tasks.findIndex((t) => t.id === activeId);
          const overTaskIndex = columns[activeIndex].tasks.findIndex((t) => t.id === overId);

          if (activeTaskIndex !== overTaskIndex && activeTaskIndex !== -1 && overTaskIndex !== -1) {
             const newColumns = [...columns];
             newColumns[activeIndex] = { ...newColumns[activeIndex] };
             newColumns[activeIndex].tasks = arrayMove(
               newColumns[activeIndex].tasks,
               activeTaskIndex,
               overTaskIndex
             );
             return newColumns;
          }
        }
        return columns;
       });
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setColumns((columns) => {
        const activeIndex = columns.findIndex((c) => c.tasks.some((t) => t.id === activeId));
        const overIndex = columns.findIndex((c) => c.tasks.some((t) => t.id === overId));
        
        if (activeIndex === -1 || overIndex === -1) return columns;

        // DO NOT process same-column reorder in onDragOver to prevent jitter!
        if (activeIndex === overIndex) return columns;

        const activeTaskIndex = columns[activeIndex].tasks.findIndex((t) => t.id === activeId);
        const overTaskIndex = columns[overIndex].tasks.findIndex((t) => t.id === overId);

        const newColumns = [...columns];
        newColumns[activeIndex] = { ...newColumns[activeIndex], tasks: [...newColumns[activeIndex].tasks] };
        newColumns[overIndex] = { ...newColumns[overIndex], tasks: [...newColumns[overIndex].tasks] };

        const [movedTask] = newColumns[activeIndex].tasks.splice(activeTaskIndex, 1);
        movedTask.columnId = newColumns[overIndex].id;
        
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newColumns[overIndex].tasks.splice(overTaskIndex >= 0 ? overTaskIndex + modifier : newColumns[overIndex].tasks.length + 1, 0, movedTask);
        
        return newColumns;
      });
    }

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
       setColumns((columns) => {
        const activeIndex = columns.findIndex((c) => c.tasks.some((t) => t.id === activeId));
        const overIndex = columns.findIndex((col) => col.id === overId);
        
        if (activeIndex === -1 || overIndex === -1) return columns;
        if (activeIndex === overIndex) return columns;

        const activeTaskIndex = columns[activeIndex].tasks.findIndex((t) => t.id === activeId);
        
        const newColumns = [...columns];
        newColumns[activeIndex] = { ...newColumns[activeIndex], tasks: [...newColumns[activeIndex].tasks] };
        newColumns[overIndex] = { ...newColumns[overIndex], tasks: [...newColumns[overIndex].tasks] };

        const [movedTask] = newColumns[activeIndex].tasks.splice(activeTaskIndex, 1);
        movedTask.columnId = newColumns[overIndex].id;
        newColumns[overIndex].tasks.push(movedTask);
        return newColumns;
       });
    }
  }

  if (!isMounted) {
    return (
      <div className="flex h-full w-full overflow-x-auto overflow-y-hidden p-6 gap-6">
        {/* Skeleton state */}
        <div className="w-[320px] h-[300px] bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
        <div className="w-[320px] h-[400px] bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
        <div className="w-[320px] h-[60px] bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-x-auto overflow-y-hidden p-6 gap-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-6 items-start h-full pb-4">
          <SortableContext items={columns.map((col) => col.id)}>
            {columns.map((col) => (
              <ColumnContainer 
                key={col.id} 
                column={col} 
                onTaskAdd={createTask}
                onTaskDelete={deleteTask}
                onTaskUpdate={updateTask}
                onColumnDelete={deleteColumn}
                onColumnUpdate={updateColumn}
              />
            ))}
          </SortableContext>
          
          {!addingColumn ? (
            <button 
              onClick={() => setAddingColumn(true)}
              className="glass-column rounded-2xl w-[320px] flex items-center gap-2 p-4 text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0 h-[60px]"
            >
              <span className="font-medium">+ Add another list</span>
            </button>
          ) : (
            <div className="glass-column rounded-2xl w-[320px] flex flex-col gap-2 p-3 flex-shrink-0 border border-indigo-500/50 self-start">
              <input
                className="bg-black/30 border border-indigo-500/50 rounded-xl px-3 py-2 outline-none text-white text-sm w-full"
                placeholder="Enter list title..."
                value={newColumnTitle}
                autoFocus
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submitNewColumn();
                  } else if (e.key === "Escape") {
                    setAddingColumn(false);
                    setNewColumnTitle("");
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={submitNewColumn}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  Add list
                </button>
                <button 
                  onClick={() => {
                    setAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                  className="text-gray-400 hover:text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeColumn && <ColumnContainer column={activeColumn} isOverlay />}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
