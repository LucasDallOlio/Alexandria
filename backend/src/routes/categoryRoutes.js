const router = require('express').Router();
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gerenciamento de categorias de livros
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar categorias
 *     tags: [Categories]
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
 *         description: Lista paginada de categorias
 */
router.get('/', authenticate, listCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Buscar categoria por ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados da categoria
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/:id', authenticate, getCategory);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Criar categoria (admin)
 *     tags: [Categories]
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
 *               name: { type: string, example: Romance }
 *               description: { type: string, example: Obras de ficção romântica }
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: name é obrigatório
 */
router.post('/', authenticate, authorize('admin'), createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualizar categoria (admin)
 *     tags: [Categories]
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
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 */
router.put('/:id', authenticate, authorize('admin'), updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remover categoria (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Categoria removida
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

module.exports = router;
