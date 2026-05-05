const Category = require('../models/Category');

async function listCategories(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await Category.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name é obrigatório' });

    const id = await Category.create({ name, description });
    const category = await Category.findById(id);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    const fields = {};

    if (name !== undefined) fields.name = name;
    if (description !== undefined) fields.description = description;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Categoria não encontrada' });

    await Category.update(req.params.id, fields);
    res.json({ message: 'Categoria atualizada com sucesso' });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Categoria não encontrada' });

    await Category.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
