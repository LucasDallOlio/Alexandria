const Loan = require('../models/Loan');
const Book = require('../models/Book');

async function listLoans(req, res, next) {
  try {
    const { page, limit } = req.query;
    const { id, role } = req.user;

    const result =
      role === 'admin'
        ? await Loan.findAll({ page, limit })
        : await Loan.findByUser(id, { page, limit });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getLoan(req, res, next) {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Empréstimo não encontrado' });

    if (req.user.role !== 'admin' && loan.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(loan);
  } catch (err) {
    next(err);
  }
}

async function createLoan(req, res, next) {
  try {
    const { book_id, due_date } = req.body;

    if (!book_id || !due_date) {
      return res.status(400).json({ message: 'book_id e due_date são obrigatórios' });
    }

    const book = await Book.findById(book_id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado' });

    if (book.available_qty < 1) {
      return res.status(409).json({ message: 'Livro sem exemplares disponíveis no momento' });
    }

    const id = await Loan.create({ user_id: req.user.id, book_id, due_date });
    await Book.decrementAvailable(book_id);

    const loan = await Loan.findById(id);
    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
}

async function returnLoan(req, res, next) {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Empréstimo não encontrado' });

    if (loan.status === 'returned') {
      return res.status(409).json({ message: 'Livro já foi devolvido' });
    }

    await Loan.markReturned(req.params.id);
    await Book.incrementAvailable(loan.book_id);

    res.json({ message: 'Devolução registrada com sucesso' });
  } catch (err) {
    next(err);
  }
}

async function deleteLoan(req, res, next) {
  try {
    const existing = await Loan.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Empréstimo não encontrado' });

    await Loan.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listLoans, getLoan, createLoan, returnLoan, deleteLoan };
