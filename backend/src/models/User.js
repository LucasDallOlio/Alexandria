const pool = require('../config/database');

const User = {
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users LIMIT ? OFFSET ?',
      [Number(limit), offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async create({ name, email, password, role = 'user' }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const columns = Object.keys(fields).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await pool.query(`UPDATE users SET ${columns} WHERE id = ?`, values);
  },

  async remove(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },
};

module.exports = User;
