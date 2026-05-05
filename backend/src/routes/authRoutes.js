const router = require('express').Router();
const { register, login, profile } = require('../controllers/authController');
const authenticate = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e perfil do usuário
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes
 *       409:
 *         description: E-mail já cadastrado
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário e obter token JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@alexandria.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado — retorna o token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string, enum: [admin, user] }
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Retornar dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário logado
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/profile', authenticate, profile);

module.exports = router;
