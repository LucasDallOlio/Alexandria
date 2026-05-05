const pool = require('../config/database');

const Loan = {
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      `SELECT l.*, u.name AS user_name, u.email AS user_email, b.title AS book_title
       FROM loans l
       JOIN users u ON l.user_id = u.id
       JOIN books b ON l.book_id = b.id
       ORDER BY l.loan_date DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM loans');
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async findByUser(userId, { page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      `SELECT l.*, b.title AS book_title
       FROM loans l
       JOIN books b ON l.book_id = b.id
       WHERE l.user_id = ?
       ORDER BY l.loan_date DESC
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM loans WHERE user_id = ?',
      [userId]
    );
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT l.*, u.name AS user_name, u.email AS user_email, b.title AS book_title
       FROM loans l
       JOIN users u ON l.user_id = u.id
       JOIN books b ON l.book_id = b.id
       WHERE l.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ user_id, book_id, due_date }) {
    const [result] = await pool.query(
      'INSERT INTO loans (user_id, book_id, due_date, status) VALUES (?, ?, ?, ?)',
      [user_id, book_id, due_date, 'active']
    );
    return result.insertId;
  },

  async markReturned(id) {
    await pool.query(
      "UPDATE loans SET status = 'returned', return_date = NOW() WHERE id = ?",
      [id]
    );
  },

  async remove(id) {
    await pool.query('DELETE FROM loans WHERE id = ?', [id]);
  },
};

module.exports = Loan;
