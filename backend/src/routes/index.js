const router = require('express').Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const authorRoutes = require('./authorRoutes');
const categoryRoutes = require('./categoryRoutes');
const bookRoutes = require('./bookRoutes');
const loanRoutes = require('./loanRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/authors', authorRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/loans', loanRoutes);

module.exports = router;
