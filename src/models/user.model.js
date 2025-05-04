const pool = require('../database/pg.database');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = {
  findByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (username, email, password) => {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  update: async (id, username, email, password) => {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      params.push(username);
    }
    if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        params.push(email);
    }
    if (password !== undefined) {
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updates.push(`password = $${paramIndex++}`);
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return null;
    }

    params.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, created_at`;

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);
    return result.rows[0];
  },

  getTodoStats: async (userId) => {
    const result = await pool.query(
      `SELECT
          COUNT(*) AS total,
          COUNT(CASE WHEN completed = TRUE THEN 1 END) AS completed,
          COUNT(CASE WHEN completed = FALSE THEN 1 END) AS pending
        FROM todos
        WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },
};

module.exports = User;