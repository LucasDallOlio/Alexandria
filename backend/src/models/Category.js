const pool = require('../config/database');

const Category = {
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      'SELECT * FROM categories LIMIT ? OFFSET ?',
      [Number(limit), offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM categories');
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, description }) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const columns = Object.keys(fields).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await pool.query(`UPDATE categories SET ${columns} WHERE id = ?`, values);
  },

  async remove(id) {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  },
};

module.exports = Category;
