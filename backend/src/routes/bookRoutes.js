const router = require('express').Router();
const {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Gerenciamento do acervo de livros
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Listar livros do acervo
 *     tags: [Books]
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
 *         description: Lista paginada de livros com autor e categoria
 */
router.get('/', authenticate, listBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Buscar livro por ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do livro
 *       404:
 *         description: Livro não encontrado
 */
router.get('/:id', authenticate, getBook);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Cadastrar livro no acervo (admin)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author_id]
 *             properties:
 *               title: { type: string, example: Dom Casmurro }
 *               isbn: { type: string, example: "9788525406958" }
 *               author_id: { type: integer, example: 1 }
 *               category_id: { type: integer, example: 2 }
 *               quantity: { type: integer, example: 3 }
 *               published_year: { type: integer, example: 1899 }
 *     responses:
 *       201:
 *         description: Livro cadastrado
 *       400:
 *         description: title e author_id são obrigatórios
 */
router.post('/', authenticate, authorize('admin'), createBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Atualizar livro (admin)
 *     tags: [Books]
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
 *               title: { type: string }
 *               isbn: { type: string }
 *               author_id: { type: integer }
 *               category_id: { type: integer }
 *               quantity: { type: integer }
 *               published_year: { type: integer }
 *     responses:
 *       200:
 *         description: Livro atualizado
 *       404:
 *         description: Livro não encontrado
 */
router.put('/:id', authenticate, authorize('admin'), updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Remover livro do acervo (admin)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Livro removido
 *       404:
 *         description: Livro não encontrado
 */
router.delete('/:id', authenticate, authorize('admin'), deleteBook);

module.exports = router;
