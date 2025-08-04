'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSpotlight } from '../../../components/ui/card-spotlight';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'started' | 'done';
  subject: string;
  due_date?: string;
  created_at: string;
}

const TaskManager = () => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [parsedDatePreview, setParsedDatePreview] = useState<string>('');
  const [dateTimeout, setDateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'not_started' as 'not_started' | 'started' | 'done',
    subject: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchSubjects();
    
    // Cleanup timeout on unmount
    return () => {
      if (dateTimeout) clearTimeout(dateTimeout);
    };
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tasks:', data); // Debug log
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  // Enhanced natural language date parsing function using GPT-4o-mini
  const parseNaturalDate = async (input: string): Promise<string> => {
    if (!input.trim()) return '';
    
    // Try standard date formats first
    const standardDate = new Date(input);
    if (!isNaN(standardDate.getTime())) {
      return formatDateTimeForAPI(standardDate);
    }

    try {
      const response = await fetch('/api/parse-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          currentDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.parsedDate || input;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    
    // If API fails, return the original input
    return input;
  };

  const formatDateTimeForAPI = (date: Date): string => {
    // Format as YYYY-MM-DDTHH:MM in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Add ordinal suffix to day
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${weekday}, ${getOrdinal(day)} ${month}`;
  };

  const handleDueDateChange = (value: string) => {
    setNewTask({ ...newTask, due_date: value });
    
    // Clear existing timeout
    if (dateTimeout) {
      clearTimeout(dateTimeout);
    }
    
    // Clear preview immediately when typing
    setParsedDatePreview('');
    
    // Show preview of parsed date after 1 second of no typing
    if (value.trim() && value.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          const parsed = await parseNaturalDate(value);
          if (parsed && parsed !== value) {
            const date = new Date(parsed);
            if (!isNaN(date.getTime())) {
              setParsedDatePreview(formatDateForDisplay(parsed));
            } else {
              setParsedDatePreview('');
            }
          } else {
            setParsedDatePreview('');
          }
        } catch (error) {
          setParsedDatePreview('');
        }
      }, 500);
      
      setDateTimeout(timeout);
    } else {
      setParsedDatePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setLoading(true);
    try {
      // Parse the natural language due date
      const parsedDueDate = await parseNaturalDate(newTask.due_date);
      
      const taskData = {
        ...newTask,
        due_date: parsedDueDate
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([task, ...tasks]);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          status: 'not_started',
          subject: '',
          due_date: ''
        });
        setParsedDatePreview('');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: !completed } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const completedTasks = Array.isArray(tasks) ? tasks.filter(task => task.completed) : [];
  const pendingTasks = Array.isArray(tasks) ? tasks.filter(task => !task.completed) : [];

  return (
    <div className="space-y-6">
      {/* Task Creation Form */}
      <CardSpotlight className="p-6">
        <h2 className="font-aeonik-bold text-xl mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
              task title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                status
              </label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as 'not_started' | 'started' | 'done' })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              >
                <option value="not_started">Not Started</option>
                <option value="started">Started</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                subject
              </label>
              <select
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              >
                <option value="">No Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
              description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              placeholder="Task details..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-aeonik-regular text-gray-300 mb-2">
              due date
            </label>
            <input
              type="text"
              value={newTask.due_date}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
              placeholder="tomorrow 2pm, next monday, in 3 days, friday 2pm"
            />
            {parsedDatePreview && (
              <div className="mt-1 text-sm text-green-400 font-aeonik-regular">
                → {parsedDatePreview}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'adding...' : 'add task'}
          </button>
        </form>
      </CardSpotlight>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSpotlight className="p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-blue-400">{tasks.length}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Total Tasks</div>
        </CardSpotlight>
        <CardSpotlight className="p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-green-400">{completedTasks.length}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Completed</div>
        </CardSpotlight>
        <CardSpotlight className="p-4 text-center">
          <div className="text-2xl font-aeonik-bold text-yellow-400">{pendingTasks.length}</div>
          <div className="text-sm font-aeonik-regular text-gray-400">Pending</div>
        </CardSpotlight>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="font-aeonik-bold text-lg mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <CardSpotlight key={task.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-400 hover:border-blue-400 transition-colors flex items-center justify-center"
                    >
                      {task.completed === true ? <span className="text-blue-400">✓</span> : null}
                    </button>
                    <div className="flex-1">
                      <h4 className="font-aeonik-medium text-lg">{task.title}</h4>
                      {task.description && (
                        <p className="font-aeonik-regular text-gray-400 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority ? task.priority.toUpperCase() : 'NO PRIORITY'}
                        </span>
                        {task.due_date ? (
                          <span className="text-xs text-gray-500">
                            Due: {formatDateForDisplay(task.due_date)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    🗑️
                  </button>
                </div>
              </CardSpotlight>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-aeonik-bold text-lg mb-4">Completed Tasks</h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <CardSpotlight key={task.id} className="p-4 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="mt-1 w-5 h-5 rounded border-2 border-green-400 bg-green-400 text-black flex items-center justify-center"
                    >
                      ✓
                    </button>
                    <div className="flex-1">
                      <h4 className="font-aeonik-medium text-lg line-through">{task.title}</h4>
                      {task.description && (
                        <p className="font-aeonik-regular text-gray-500 text-sm mt-1 line-through">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    🗑️
                  </button>
                </div>
              </CardSpotlight>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <CardSpotlight className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="font-aeonik-bold text-lg mb-2">No tasks yet</h3>
          <p className="font-aeonik-regular text-gray-400">Create your first task to get started!</p>
        </CardSpotlight>
      )}
    </div>
  );
};

export default TaskManager;
