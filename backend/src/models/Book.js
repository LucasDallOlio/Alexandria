const pool = require('../config/database');

const Book = {
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      `SELECT b.*, a.name AS author_name, c.name AS category_name
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.id
       LEFT JOIN categories c ON b.category_id = c.id
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM books');
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT b.*, a.name AS author_name, c.name AS category_name
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.id
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ title, isbn, author_id, category_id, quantity = 1, published_year }) {
    const [result] = await pool.query(
      `INSERT INTO books (title, isbn, author_id, category_id, quantity, available_qty, published_year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, isbn || null, author_id, category_id || null, quantity, quantity, published_year || null]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const columns = Object.keys(fields).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await pool.query(`UPDATE books SET ${columns} WHERE id = ?`, values);
  },

  async remove(id) {
    await pool.query('DELETE FROM books WHERE id = ?', [id]);
  },

  async decrementAvailable(id) {
    await pool.query(
      'UPDATE books SET available_qty = available_qty - 1 WHERE id = ? AND available_qty > 0',
      [id]
    );
  },

  async incrementAvailable(id) {
    await pool.query(
      'UPDATE books SET available_qty = available_qty + 1 WHERE id = ?',
      [id]
    );
  },
};

module.exports = Book;
