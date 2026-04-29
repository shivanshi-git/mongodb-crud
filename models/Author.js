// models/Author.js
const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  country: { type: String, default: 'Unknown' }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema);


// ─────────────────────────────────────────────────────
// models/Genre.js
// ─────────────────────────────────────────────────────
// Separate file — shown here combined for brevity.
// In your project, split into individual files.
