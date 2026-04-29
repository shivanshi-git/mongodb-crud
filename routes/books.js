const router = require('express').Router();
const Book   = require('../models/Book');

// ── CREATE ──────────────────────────────────────────────
// POST /api/books
// Body: { title, year, author: "<authorId>", genres: ["<genreId>", ...] }
router.post('/', async (req, res) => {
  try {
    const book = await Book.create(req.body);

    // Populate returns full author + genre docs instead of bare IDs
    await book.populate('author', 'name country');
    await book.populate('genres', 'name');

    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── READ ALL ────────────────────────────────────────────
// GET /api/books
// Uses .populate() — equivalent to SQL JOIN — to embed related docs
router.get('/', async (req, res) => {
  try {
    const books = await Book.find()
      .populate('author', 'name country')   // one-to-many: replace author ObjectId with doc
      .populate('genres', 'name')           // many-to-many: replace each genre ObjectId with doc
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── READ ONE ────────────────────────────────────────────
// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author', 'name country')
      .populate('genres', 'name');

    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE ──────────────────────────────────────────────
// PUT /api/books/:id
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'name country')
    .populate('genres', 'name');

    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE ──────────────────────────────────────────────
// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AGGREGATE (advanced) ────────────────────────────────
// GET /api/books/aggregate/stats
// Raw $lookup pipeline — same as populate but shows you the MongoDB internals
router.get('/aggregate/stats', async (req, res) => {
  try {
    const result = await Book.aggregate([
      // JOIN authors collection
      { $lookup: {
          from: 'authors',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo'
      }},
      // JOIN genres collection
      { $lookup: {
          from: 'genres',
          localField: 'genres',
          foreignField: '_id',
          as: 'genreInfo'
      }},
      { $unwind: '$authorInfo' },
      { $project: {
          title: 1, year: 1,
          authorName: '$authorInfo.name',
          genreNames: '$genreInfo.name',
          genreCount: { $size: '$genreInfo' }
      }}
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
