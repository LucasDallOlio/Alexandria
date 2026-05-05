const Book = require('../models/Book');

async function listBooks(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await Book.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getBook(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado' });
    res.json(book);
  } catch (err) {
    next(err);
  }
}

async function createBook(req, res, next) {
  try {
    const { title, isbn, author_id, category_id, quantity, published_year } = req.body;

    if (!title || !author_id) {
      return res.status(400).json({ message: 'title e author_id são obrigatórios' });
    }

    const id = await Book.create({ title, isbn, author_id, category_id, quantity, published_year });
    const book = await Book.findById(id);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
}

async function updateBook(req, res, next) {
  try {
    const { title, isbn, author_id, category_id, quantity, published_year } = req.body;
    const fields = {};

    if (title !== undefined) fields.title = title;
    if (isbn !== undefined) fields.isbn = isbn;
    if (author_id !== undefined) fields.author_id = author_id;
    if (category_id !== undefined) fields.category_id = category_id;
    if (quantity !== undefined) fields.quantity = quantity;
    if (published_year !== undefined) fields.published_year = published_year;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const existing = await Book.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Livro não encontrado' });

    await Book.update(req.params.id, fields);
    res.json({ message: 'Livro atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const existing = await Book.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Livro não encontrado' });

    await Book.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
