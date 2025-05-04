const pool = require('../database/pg.database');

const Todo = {
  getAll: async (userId, sortBy, projectName) => {
    let query = 'SELECT * FROM todos WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (projectName) {
      query += ` AND project_name ILIKE $${paramIndex++}`;
      params.push(projectName);
    }

    if (sortBy === 'deadline') {
      query += ' ORDER BY deadline NULLS LAST, created_at DESC';
    } else if (sortBy === 'project') {
      query += ' ORDER BY project_name NULLS FIRST, deadline NULLS LAST, created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  getById: async (id, userId) => {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  },

  create: async (userId, title, description, deadline, projectName) => {
    const result = await pool.query(
      'INSERT INTO todos (user_id, title, description, deadline, project_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description, deadline, projectName]
    );
    return result.rows[0];
  },

  update: async (id, userId, title, description, completed, deadline, projectName) => {
    const updates = [];
    const params = [userId, id];
    let paramIndex = 3;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (completed !== undefined) {
      updates.push(`completed = $${paramIndex++}`);
      params.push(completed);
    }
    if (deadline !== undefined) {
      updates.push(`deadline = $${paramIndex++}`);
      params.push(deadline);
    }
    if (projectName !== undefined) {
      updates.push(`project_name = $${paramIndex++}`);
      params.push(projectName);
    }

    if (updates.length === 0) {
      return null;
    }

    const query = `UPDATE todos SET ${updates.join(', ')} WHERE id = $2 AND user_id = $1 RETURNING *`;

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  delete: async (id, userId) => {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    return result.rows[0];
  },

  updateProjectNameForUser: async (userId, oldProjectName, newProjectName) => {
    const result = await pool.query(
      'UPDATE todos SET project_name = $3 WHERE user_id = $1 AND project_name = $2',
      [userId, oldProjectName, newProjectName]
    );
    return result.rowCount;
  },

  setProjectNullForTasksByProjectAndUser: async (userId, projectName) => {
    const result = await pool.query(
      'UPDATE todos SET project_name = NULL WHERE user_id = $1 AND project_name = $2',
      [userId, projectName]
    );
    return result.rowCount;
  },

  getUniqueProjectNames: async (userId) => {
    const result = await pool.query(
      'SELECT DISTINCT project_name FROM todos WHERE user_id = $1 AND project_name IS NOT NULL AND project_name != $2 ORDER BY project_name',
      [userId, '']
    );
    return result.rows.map(row => row.project_name);
  },

  clearCompletedTasks: async (userId) => {
    const result = await pool.query(
      'DELETE FROM todos WHERE user_id = $1 AND completed = TRUE RETURNING *',
      [userId]
    );
    return result.rowCount;
  }
};

module.exports = Todo;
