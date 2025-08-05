'use client';

import React, { useState, useEffect } from 'react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';
import { useSession } from 'next-auth/react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'started' | 'completed';
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

interface KanbanBoardProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onLoadingChange }) => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalColumn, setModalColumn] = useState<'not_started' | 'started' | 'completed'>('not_started');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: ''
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Cache key for localStorage
  const TASKS_CACHE_KEY = 'kanban-tasks-cache';
  const CACHE_EXPIRY_KEY = 'kanban-cache-expiry';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  useEffect(() => {
    loadTasksWithCache();
  }, []);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading || initialLoading);
    }
  }, [loading, initialLoading, onLoadingChange]);

  // Load tasks with intelligent caching
  const loadTasksWithCache = async () => {
    try {
      // Check if we have valid cached data
      const cachedTasks = localStorage.getItem(TASKS_CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      const now = Date.now();

      if (cachedTasks && cacheExpiry && now < parseInt(cacheExpiry)) {
        // Use cached data for instant loading
        const parsedTasks = JSON.parse(cachedTasks);
        setTasks(parsedTasks);
        setInitialLoading(false);
        
        // Optional: Still fetch fresh data in background for next time
        setTimeout(() => {
          fetchTasksAndCache(false);
        }, 100);
        return;
      }

      // No valid cache, fetch fresh data
      await fetchTasksAndCache(true);
    } catch (error) {
      console.error('Error loading tasks with cache:', error);
      // Fallback to regular fetch
      await fetchTasksAndCache(true);
    }
  };

  // Fetch tasks and update cache
  const fetchTasksAndCache = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        
        // Update cache
        localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setInitialLoading(false);
    }
  };

  // Legacy function for compatibility
  const fetchTasks = () => fetchTasksAndCache(true);

  // Clear cache when tasks are modified
  const clearTasksCache = () => {
    localStorage.removeItem(TASKS_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  };

  const createTask = async () => {
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      
      if (editingTask) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            due_date: formData.due_date || null
          }),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks(prev => prev.map(task => 
            task.id === editingTask.id ? updatedTask : task
          ));
          setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
          setShowModal(false);
          setEditingTask(null);
          clearTasksCache(); // Clear cache after modification
        }
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            status: modalColumn,
            due_date: formData.due_date || null
          }),
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks(prev => [...prev, newTask]);
          setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
          setShowModal(false);
          clearTasksCache(); // Clear cache after modification
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: 'not_started' | 'started' | 'completed') => {
    // OPTIMISTIC UPDATE: Update UI immediately
    const previousTasks = tasks;
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, completed: newStatus === 'completed' }
        : task
    ));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          completed: newStatus === 'completed'
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        // Update with server response to ensure consistency
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        clearTasksCache(); // Clear cache after successful update
      } else {
        // Revert optimistic update on failure
        setTasks(previousTasks);
        console.error('Failed to update task status');
      }
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks);
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        setDeleteConfirm(null);
        clearTasksCache(); // Clear cache after deletion
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Get the column being dragged over
    const columnElement = e.currentTarget as HTMLElement;
    const columnTitle = columnElement.querySelector('h3')?.textContent;
    if (columnTitle) {
      const column = columns.find(c => c.title === columnTitle);
      if (column) {
        setDragOverColumn(column.id);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column (not a child element)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'not_started' | 'started' | 'completed') => {
    e.preventDefault();
    setDragOverColumn(null); // Clear drag over state immediately
    if (draggedTask && draggedTask.status !== newStatus) {
      // Clear dragged task immediately for instant feedback
      setDraggedTask(null);
      // Update status with optimistic update
      updateTaskStatus(draggedTask.id, newStatus);
    } else {
      setDraggedTask(null);
    }
  };

  const openModal = (column: 'not_started' | 'started' | 'completed') => {
    setModalColumn(column);
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const getTasksByStatus = (status: 'not_started' | 'started' | 'completed') => {
    return tasks.filter(task => task.status === status);
  };

  const columns = [
    { id: 'not_started', title: 'Not Started', tasks: getTasksByStatus('not_started') },
    { id: 'started', title: 'Started', tasks: getTasksByStatus('started') },
    { id: 'completed', title: 'Completed', tasks: getTasksByStatus('completed') }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-aeonik-bold text-2xl mb-2">Task Board</h2>
        <p className="font-aeonik-regular text-gray-400">
          Organize your tasks with drag and drop
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id as any)}
          >
            {/* Column Header */}
            <CardSpotlight className={`p-4 transition-all duration-200 ${
              dragOverColumn === column.id ? 'ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-aeonik-bold text-lg">{column.title}</h3>
                <button
                  onClick={() => openModal(column.id as any)}
                  className="relative group overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                             hover:from-blue-500/40 hover:to-purple-500/40 text-white rounded-full w-10 h-10 
                             flex items-center justify-center transition-all duration-300 border border-white/20
                             hover:shadow-lg hover:shadow-blue-500/25 hover:scale-110 active:scale-95"
                  title="Add New Task"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                  <span className="relative z-10 text-lg font-bold">+</span>
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[200px]">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => openEditModal(task)}
                    className={`relative p-4 rounded-2xl border cursor-move transition-all duration-300 group overflow-hidden
                               hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:scale-[1.02]
                               ${getPriorityColor(task.priority)} 
                               ${draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''} 
                               hover:border-white/40 backdrop-blur-sm`}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-aeonik-bold text-sm text-white group-hover:text-white/90 transition-colors">{task.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent edit modal from opening
                          setDeleteConfirm(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-300 
                                   hover:scale-110 active:scale-95 p-1 rounded-lg hover:bg-red-400/10"
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-400 mb-3 group-hover:text-gray-300 transition-colors line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-3 py-1 rounded-full font-aeonik-medium transition-all duration-300 ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                      </span>
                      
                      {task.due_date && (
                        <span className={`px-2 py-1 rounded-lg font-aeonik-medium ${
                          isOverdue(task.due_date, task.status) 
                            ? 'text-red-400 bg-red-400/10 border border-red-400/30' 
                            : 'text-gray-400 bg-gray-400/10 border border-gray-400/30'
                        }`}>
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardSpotlight>
          </div>
        ))}
      </div>

      {/* Task Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/50 to-black/60 border border-white/10 rounded-3xl w-full max-w-lg mx-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Animated pixel grid background */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full animate-pulse" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-30 blur-sm"></div>
            
            <div className="relative p-8">
              <div className="text-center mb-8">
                <h3 className="font-aeonik-bold text-3xl mb-2 text-white bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-aeonik-medium text-white/90 mb-3 group-hover:text-white transition-colors">
                    Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-4 bg-black/50 border border-white/20 rounded-2xl text-white placeholder-white/40 
                                 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                                 transition-all duration-300 hover:border-white/40 hover:bg-black/70
                                 backdrop-blur-sm font-aeonik-regular"
                      placeholder="Enter your task title..."
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-aeonik-medium text-white/90 mb-3 group-hover:text-white transition-colors">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-4 bg-black/50 border border-white/20 rounded-2xl text-white placeholder-white/40 
                                 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                                 transition-all duration-300 h-32 resize-none hover:border-white/40 hover:bg-black/70
                                 backdrop-blur-sm font-aeonik-regular"
                      placeholder="Describe your task in detail..."
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-aeonik-medium text-white/90 mb-3 group-hover:text-white transition-colors">
                    Priority Level
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-4 bg-black/50 border border-white/20 rounded-2xl text-white 
                                 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                                 transition-all duration-300 cursor-pointer appearance-none hover:border-white/40 hover:bg-black/70
                                 backdrop-blur-sm font-aeonik-regular"
                    >
                      <option value="low" className="bg-gray-900 text-white py-2">🟢 Low Priority</option>
                      <option value="medium" className="bg-gray-900 text-white py-2">🟡 Medium Priority</option>
                      <option value="high" className="bg-gray-900 text-white py-2">🔴 High Priority</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-aeonik-medium text-white/90 mb-3 group-hover:text-white transition-colors">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full p-4 bg-black/50 border border-white/20 rounded-2xl text-white 
                                 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                                 transition-all duration-300 cursor-pointer hover:border-white/40 hover:bg-black/70
                                 backdrop-blur-sm font-aeonik-regular"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={createTask}
                  disabled={!formData.title.trim() || loading}
                  className="flex-1 relative group overflow-hidden bg-gradient-to-r from-blue-600/90 to-purple-600/90 
                             hover:from-blue-500 hover:to-purple-500 text-white py-4 px-6 rounded-2xl 
                             transition-all duration-300 font-aeonik-bold text-lg
                             hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-[1.02] hover:-translate-y-1
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
                             active:scale-95 border border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingTask ? 'Update Task' : 'Create Task'}
                      </>
                    )}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
                  }}
                  className="flex-1 relative group overflow-hidden bg-black/50 hover:bg-red-500/20 
                             text-red-400 hover:text-red-300 py-4 px-6 rounded-2xl 
                             transition-all duration-300 font-aeonik-bold text-lg
                             hover:shadow-2xl hover:shadow-red-500/25 hover:scale-[1.02] hover:-translate-y-1
                             active:scale-95 border border-red-400/20 hover:border-red-400/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">❌ Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-900/30 to-black/95 border border-red-400/20 rounded-3xl w-full max-w-md mx-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Animated warning pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full animate-pulse" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,68,68,0.3) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            
            {/* Glowing red border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/30 via-orange-500/20 to-red-500/30 opacity-40 blur-sm"></div>
            
            <div className="relative p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30">
                  <span className="text-3xl animate-bounce">⚠️</span>
                </div>
                <h3 className="font-aeonik-bold text-2xl mb-2 text-red-400">
                  Delete Task
                </h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-white/90 mb-2 font-aeonik-regular text-lg">
                  Are you sure you want to delete this task?
                </p>
                <p className="text-red-400/80 text-sm font-aeonik-medium">
                  ⚡ This action cannot be undone
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => deleteTask(deleteConfirm)}
                  className="flex-1 relative group overflow-hidden bg-gradient-to-r from-red-600/90 to-orange-600/90 
                             hover:from-red-500 hover:to-orange-500 text-white py-4 px-6 rounded-2xl 
                             transition-all duration-300 font-aeonik-bold text-lg
                             hover:shadow-2xl hover:shadow-red-500/25 hover:scale-[1.02] hover:-translate-y-1
                             active:scale-95 border border-red-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">🗑️ Delete Forever</span>
                </button>
                
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 relative group overflow-hidden bg-black/50 hover:bg-gray-500/20 
                             text-white hover:text-gray-200 py-4 px-6 rounded-2xl 
                             transition-all duration-300 font-aeonik-bold text-lg
                             hover:shadow-2xl hover:shadow-gray-500/25 hover:scale-[1.02] hover:-translate-y-1
                             active:scale-95 border border-white/20 hover:border-white/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">↩️ Keep Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
