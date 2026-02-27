const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const {
  createTaskValidation,
  updateTaskValidation
} = require('../middleware/taskValidation');

router.post(
  '/',
  authMiddleware,
  createTaskValidation,
  validate,
  taskController.createTask
);


router.put(
  '/:id',
  authMiddleware,
  updateTaskValidation,
  validate,
  taskController.updateTask

);

router.get(
  "/project/:projectId",
   authMiddleware,
   updateTaskValidation,
   validate,
   taskController.getTasksByProject
  );
  
router.get('/', authMiddleware, taskController.getTasks);

router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;