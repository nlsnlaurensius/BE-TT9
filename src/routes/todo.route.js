const express = require('express');
const router = express.Router();
const TodoController = require('../controllers/todo.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.route('/')
  .get(TodoController.getAllTodos)
  .post(TodoController.createTodo);

router.delete('/completed', TodoController.clearCompletedTodos);

router.put('/projects/:name', TodoController.updateProject);

router.delete('/projects/:name', TodoController.deleteProject);

router.route('/:id')
  .get(TodoController.getTodoById)
  .put(TodoController.updateTodo)
  .delete(TodoController.deleteTodo);

module.exports = router;
