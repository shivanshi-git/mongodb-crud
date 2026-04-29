const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year:  { type: Number, required: true },

  // ── ONE-TO-MANY ──────────────────────────────────────
  // Each book belongs to ONE author.
  // We store the Author's _id here as a reference.
  // mongoose can .populate() this to get the full author doc.
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },

  // ── MANY-TO-MANY ─────────────────────────────────────
  // A book can have MANY genres, and each genre can tag MANY books.
  // MongoDB's idiomatic approach: store an array of ObjectId refs
  // on one side (here, on the Book). No junction/pivot table needed.
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }]

}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
