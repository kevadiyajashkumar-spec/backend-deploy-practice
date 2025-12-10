const pool = require('../config/database');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { inputText } = req.body;
    const userId = req.user.userId;

    if (!inputText) {
      return res.status(400).json({ error: 'inputText is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (userId, inputText, status, progress) VALUES (?, ?, ?, ?)',
      [userId, inputText, 'pending', 0]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: result.insertId,
        userId,
        inputText,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error while creating task' });
  }
};

// Get all tasks for logged-in user
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [tasks] = await pool.query(
      'SELECT id, inputText, status, progress, createdAt FROM tasks WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    res.json({
      message: 'Tasks retrieved successfully',
      tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
};

// Get a specific task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.json({
      message: 'Task retrieved successfully',
      task: tasks[0],
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching task' });
  }
};

// Update task result (when Web Worker completes processing)
const updateTaskResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { result, status, progress } = req.body;
    const userId = req.user.userId;

    // Verify task belongs to user
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Update task
    await pool.query(
      'UPDATE tasks SET status = ?, result = ?, progress = ? WHERE id = ?',
      [status || 'completed', result, progress || 100, id]
    );

    const [updatedTasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Task updated successfully',
      task: updatedTasks[0],
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error while updating task' });
  }
};

// Update task progress (from Web Worker)
const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user.userId;

    // Verify task belongs to user
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Update progress
    await pool.query(
      'UPDATE tasks SET progress = ?, status = ? WHERE id = ?',
      [progress, progress < 100 ? 'processing' : 'completed', id]
    );

    res.json({
      message: 'Task progress updated',
      progress,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error while updating progress' });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskResult,
  updateTaskProgress,
};
