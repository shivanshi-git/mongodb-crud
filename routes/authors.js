const router  = require('express').Router();
const Author  = require('../models/Author');
const Book    = require('../models/Book');

// ── CREATE ──────────────────────────────────────────────
// POST /api/authors
router.post('/', async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── READ ALL ────────────────────────────────────────────
// GET /api/authors
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── READ ONE + their books (one-to-many) ────────────────
// GET /api/authors/:id
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    // Get all books that reference this author — one-to-many query
    const books = await Book.find({ author: req.params.id })
                            .populate('genres', 'name'); // also populate genre names

    res.json({ author, books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE ──────────────────────────────────────────────
// PUT /api/authors/:id
router.put('/:id', async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE ──────────────────────────────────────────────
// DELETE /api/authors/:id  (also deletes their books — cascade)
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    // Cascade delete: remove all books by this author
    const { deletedCount } = await Book.deleteMany({ author: req.params.id });

    res.json({ message: `Deleted author and ${deletedCount} book(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
