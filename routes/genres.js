const router = require('express').Router();
const Genre  = require('../models/Genre');
const Book   = require('../models/Book');

// CREATE  POST /api/genres
router.post('/', async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json(genre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL  GET /api/genres
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE + all books tagged with it (many-to-many reverse lookup)
// GET /api/genres/:id
router.get('/:id', async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ error: 'Genre not found' });

    // many-to-many: find books where genres array contains this genre id
    const books = await Book.find({ genres: req.params.id })
                            .populate('author', 'name');

    res.json({ genre, books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE  PUT /api/genres/:id
router.put('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!genre) return res.status(404).json({ error: 'Genre not found' });
    res.json(genre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE  DELETE /api/genres/:id
// also removes this genre from all books' genres[] array
router.delete('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).json({ error: 'Genre not found' });

    // $pull removes the genre id from every book's genres array
    const { modifiedCount } = await Book.updateMany(
      {},
      { $pull: { genres: req.params.id } }
    );

    res.json({ message: `Deleted genre, removed from ${modifiedCount} book(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
