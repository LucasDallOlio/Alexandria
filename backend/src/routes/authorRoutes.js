const router = require('express').Router();
const {
  listAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Gerenciamento de autores
 */

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Listar autores
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista paginada de autores
 */
router.get('/', authenticate, listAuthors);

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Buscar autor por ID
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do autor
 *       404:
 *         description: Autor não encontrado
 */
router.get('/:id', authenticate, getAuthor);

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Cadastrar autor (admin)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Machado de Assis }
 *               nationality: { type: string, example: Brasileiro }
 *               bio: { type: string, example: Escritor e poeta brasileiro do século XIX }
 *     responses:
 *       201:
 *         description: Autor criado
 *       400:
 *         description: name é obrigatório
 */
router.post('/', authenticate, authorize('admin'), createAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Atualizar autor (admin)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               nationality: { type: string }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Autor atualizado
 *       404:
 *         description: Autor não encontrado
 */
router.put('/:id', authenticate, authorize('admin'), updateAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Remover autor (admin)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Autor removido
 *       404:
 *         description: Autor não encontrado
 */
router.delete('/:id', authenticate, authorize('admin'), deleteAuthor);

module.exports = router;
