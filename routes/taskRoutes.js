const express = require('express');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskResult,
  updateTaskProgress,
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.post('/', verifyToken, createTask);
router.get('/', verifyToken, getAllTasks);
router.get('/:id', verifyToken, getTaskById);
router.put('/:id', verifyToken, updateTaskResult);
router.patch('/:id/progress', verifyToken, updateTaskProgress);

module.exports = router;
