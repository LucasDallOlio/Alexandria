const Author = require('../models/Author');

async function listAuthors(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await Author.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getAuthor(req, res, next) {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Autor não encontrado' });
    res.json(author);
  } catch (err) {
    next(err);
  }
}

async function createAuthor(req, res, next) {
  try {
    const { name, nationality, bio } = req.body;
    if (!name) return res.status(400).json({ message: 'name é obrigatório' });

    const id = await Author.create({ name, nationality, bio });
    const author = await Author.findById(id);
    res.status(201).json(author);
  } catch (err) {
    next(err);
  }
}

async function updateAuthor(req, res, next) {
  try {
    const { name, nationality, bio } = req.body;
    const fields = {};

    if (name !== undefined) fields.name = name;
    if (nationality !== undefined) fields.nationality = nationality;
    if (bio !== undefined) fields.bio = bio;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const existing = await Author.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Autor não encontrado' });

    await Author.update(req.params.id, fields);
    res.json({ message: 'Autor atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

async function deleteAuthor(req, res, next) {
  try {
    const existing = await Author.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Autor não encontrado' });

    await Author.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor };
