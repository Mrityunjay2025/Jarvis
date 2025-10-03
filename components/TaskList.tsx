import React, { useState } from 'react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onClearCompleted: () => void;
}

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
        case 'high': return 'border-red-500';
        case 'medium': return 'border-yellow-500';
        case 'low': return 'border-cyan-500';
        default: return 'border-gray-500';
    }
}

const TaskItem: React.FC<{ task: Task, onToggleTask: (id: number) => void }> = ({ task, onToggleTask }) => (
    <li className="flex items-center group py-1.5">
        <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleTask(task.id)}
            className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 rounded text-cyan-500 focus:ring-cyan-600 cursor-pointer"
        />
        <span className={`ml-3 flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'} transition-colors duration-200 group-hover:text-white`}>
            {task.text}
        </span>
        <div className={`w-2 h-2 rounded-full border-2 ${getPriorityColor(task.priority)}`}></div>
    </li>
);

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, onClearCompleted }) => {
    const [filter, setFilter] = useState('');
    const completedCount = tasks.filter(t => t.completed).length;

    const filteredTasks = tasks.filter(task =>
        task.text.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div>
            <h2 className="text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-4 font-orbitron">
                Task Management
            </h2>
            {tasks.length > 0 && (
                 <div className="mb-3">
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter tasks..."
                        className="w-full bg-gray-800/70 border border-gray-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                    />
                </div>
            )}
           
            {tasks.length === 0 ? (
                 <p className="text-xs text-gray-500">No active tasks.</p>
            ) : filteredTasks.length > 0 ? (
                <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
                    {filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggleTask={onToggleTask} />
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-gray-500">No tasks match your filter.</p>
            )}

            {completedCount > 0 && (
                 <button 
                    onClick={onClearCompleted}
                    className="text-xs text-cyan-400 hover:text-white mt-3 transition-colors duration-200"
                >
                    Clear {completedCount} Completed Task(s)
                </button>
            )}
        </div>
    );
};

export default TaskList;