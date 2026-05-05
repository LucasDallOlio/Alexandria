const pool = require('../config/database');

const Author = {
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      'SELECT * FROM authors LIMIT ? OFFSET ?',
      [Number(limit), offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM authors');
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM authors WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, nationality, bio }) {
    const [result] = await pool.query(
      'INSERT INTO authors (name, nationality, bio) VALUES (?, ?, ?)',
      [name, nationality || null, bio || null]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const columns = Object.keys(fields).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await pool.query(`UPDATE authors SET ${columns} WHERE id = ?`, values);
  },

  async remove(id) {
    await pool.query('DELETE FROM authors WHERE id = ?', [id]);
  },
};

module.exports = Author;
