const router = require('express').Router();
const {
  listLoans,
  getLoan,
  createLoan,
  returnLoan,
  deleteLoan,
} = require('../controllers/loanController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Gerenciamento de empréstimos de livros
 */

/**
 * @swagger
 * /loans:
 *   get:
 *     summary: Listar empréstimos (admin vê todos; user vê apenas os próprios)
 *     tags: [Loans]
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
 *         description: Lista paginada de empréstimos
 */
router.get('/', authenticate, listLoans);

/**
 * @swagger
 * /loans/{id}:
 *   get:
 *     summary: Buscar empréstimo por ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do empréstimo
 *       403:
 *         description: Acesso negado (usuário tentando ver empréstimo de outro)
 *       404:
 *         description: Empréstimo não encontrado
 */
router.get('/:id', authenticate, getLoan);

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Realizar empréstimo de livro (usuário autenticado)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [book_id, due_date]
 *             properties:
 *               book_id: { type: integer, example: 1 }
 *               due_date: { type: string, format: date, example: "2026-05-30" }
 *     responses:
 *       201:
 *         description: Empréstimo registrado com sucesso
 *       400:
 *         description: book_id e due_date são obrigatórios
 *       404:
 *         description: Livro não encontrado
 *       409:
 *         description: Sem exemplares disponíveis
 */
router.post('/', authenticate, createLoan);

/**
 * @swagger
 * /loans/{id}/return:
 *   patch:
 *     summary: Registrar devolução de livro (admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Devolução registrada com sucesso
 *       404:
 *         description: Empréstimo não encontrado
 *       409:
 *         description: Livro já foi devolvido
 */
router.patch('/:id/return', authenticate, authorize('admin'), returnLoan);

/**
 * @swagger
 * /loans/{id}:
 *   delete:
 *     summary: Remover registro de empréstimo (admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Empréstimo removido
 *       404:
 *         description: Empréstimo não encontrado
 */
router.delete('/:id', authenticate, authorize('admin'), deleteLoan);

module.exports = router;
