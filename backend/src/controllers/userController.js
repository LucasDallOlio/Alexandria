const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function listUsers(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await User.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const fields = {};

    if (name) fields.name = name;
    if (email) fields.email = email;
    if (role) fields.role = role;
    if (password) fields.password = await bcrypt.hash(password, 10);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Usuário não encontrado' });

    await User.update(req.params.id, fields);
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Usuário não encontrado' });

    await User.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, getUser, updateUser, deleteUser };
