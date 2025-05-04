const Todo = require('../models/todo.model');
const { successResponse, errorResponse } = require('../utils/baseResponse.util');

const TodoController = {
  getAllTodos: async (req, res) => {
    const userId = req.user.id;
    const { sortBy, project } = req.query;
    try {
      const todos = await Todo.getAll(userId, sortBy, project);
      res.json(successResponse(todos));
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },
  getTodoById: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const todo = await Todo.getById(id, userId);
      if (!todo) {
        return res.status(404).json(errorResponse('Todo not found or not authorized'));
      }
      res.json(successResponse(todo));
    } catch (error) {
      console.error(`Error fetching todo with id ${id}:`, error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },
  createTodo: async (req, res) => {
    const userId = req.user.id;
    const { title, description, deadline, project_name } = req.body;
    if (!title) {
      return res.status(400).json(errorResponse('Title is required'));
    }
    try {
      const newTodo = await Todo.create(userId, title, description, deadline, project_name);
      res.status(201).json(successResponse(newTodo, 'Todo created successfully'));
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },
  updateTodo: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, completed, deadline, project_name } = req.body;
    if (title === undefined && description === undefined && completed === undefined && deadline === undefined && project_name === undefined) {
        return res.status(400).json(errorResponse('No update data provided'));
    }
    try {
      const updatedTodo = await Todo.update(id, userId, title, description, completed, deadline, project_name);
      if (!updatedTodo) {
        return res.status(404).json(errorResponse('Todo not found or not authorized'));
      }
      res.json(successResponse(updatedTodo, 'Todo updated successfully'));
    } catch (error) {
      console.error(`Error updating todo with id ${id}:`, error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },
  deleteTodo: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const deletedTodo = await Todo.delete(id, userId);
      if (!deletedTodo) {
        return res.status(404).json(errorResponse('Todo not found or not authorized'));
      }
      res.json(successResponse(deletedTodo, 'Todo deleted successfully'));
    } catch (error) {
      console.error(`Error deleting todo with id ${id}:`, error);
      res.status(500).json(errorResponse('Internal server error', error.message));
    }
  },

  // Implementasi fungsi baru untuk rute baru
  updateProject: async (req, res) => {
      const userId = req.user.id;
      const oldProjectName = req.params.name;
      const { newProjectName } = req.body;

      if (!newProjectName) {
          return res.status(400).json(errorResponse('New project name is required'));
      }
      if (!oldProjectName) {
           return res.status(400).json(errorResponse('Old project name is required in URL'));
      }

      try {
          const rowCount = await Todo.updateProjectNameForUser(userId, oldProjectName, newProjectName);
          res.json(successResponse({ updatedCount: rowCount }, `Updated ${rowCount} tasks for project "${oldProjectName}" to "${newProjectName}"`));
      } catch (error) {
          console.error(`Error updating project "${oldProjectName}" for user ${userId}:`, error);
          res.status(500).json(errorResponse('Internal server error', error.message));
      }
  },

  deleteProject: async (req, res) => {
      const userId = req.user.id;
      const projectName = req.params.name;

      if (!projectName) {
          return res.status(400).json(errorResponse('Project name is required in URL'));
      }

      try {
          const rowCount = await Todo.setProjectNullForTasksByProjectAndUser(userId, projectName);
          res.json(successResponse({ updatedCount: rowCount }, `Set project name to NULL for ${rowCount} tasks in project "${projectName}"`));
      } catch (error) {
          console.error(`Error setting project "${projectName}" to NULL for user ${userId}:`, error);
          res.status(500).json(errorResponse('Internal server error', error.message));
      }
  },

  clearCompletedTodos: async (req, res) => {
      const userId = req.user.id;

      try {
          const rowCount = await Todo.clearCompletedTasks(userId);
          res.json(successResponse({ deletedCount: rowCount }, `Deleted ${rowCount} completed tasks`));
      } catch (error) {
          console.error(`Error clearing completed tasks for user ${userId}:`, error);
          res.status(500).json(errorResponse('Internal server error', error.message));
      }
  },
};

module.exports = TodoController;