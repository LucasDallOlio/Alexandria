const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email e password são obrigatórios' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = await User.create({ name, email, password: hashed });
    const user = await User.findById(id);

    res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email e password são obrigatórios' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function profile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, profile };
