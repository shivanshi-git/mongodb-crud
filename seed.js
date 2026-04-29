// seed.js — Run this ONCE to fill your database with sample data
// Command: node seed.js

const mongoose = require('mongoose');
const Author   = require('./models/Author');
const Genre    = require('./models/Genre');
const Book     = require('./models/Book');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/library_db');
  console.log('✅ Connected to MongoDB\n');

  // Clear old data
  await Author.deleteMany({});
  await Genre.deleteMany({});
  await Book.deleteMany({});
  console.log('🗑️  Cleared old records\n');

  // ── INSERT AUTHORS ─────────────────────────────────────
  const [tolkien, herbert, rowling, orwell, christie] = await Author.insertMany([
    { name: 'J.R.R. Tolkien',   country: 'United Kingdom' },
    { name: 'Frank Herbert',    country: 'United States'  },
    { name: 'J.K. Rowling',     country: 'United Kingdom' },
    { name: 'George Orwell',    country: 'United Kingdom' },
    { name: 'Agatha Christie',  country: 'United Kingdom' },
  ]);
  console.log('👤 Authors inserted:');
  [tolkien, herbert, rowling, orwell, christie].forEach(a =>
    console.log(`   ${a.name}  →  _id: ${a._id}`)
  );

  // ── INSERT GENRES ──────────────────────────────────────
  const [fantasy, scifi, adventure, classic, mystery, dystopia, magic] =
    await Genre.insertMany([
      { name: 'Fantasy'    },
      { name: 'Sci-Fi'     },
      { name: 'Adventure'  },
      { name: 'Classic'    },
      { name: 'Mystery'    },
      { name: 'Dystopia'   },
      { name: 'Magic'      },
    ]);
  console.log('\n🏷️  Genres inserted:');
  [fantasy, scifi, adventure, classic, mystery, dystopia, magic].forEach(g =>
    console.log(`   ${g.name}  →  _id: ${g._id}`)
  );

  // ── INSERT BOOKS ───────────────────────────────────────
  // ONE-TO-MANY  : each book has ONE author  (author field)
  // MANY-TO-MANY : each book has MANY genres (genres array)
  const books = await Book.insertMany([
    // Tolkien's books
    { title: 'The Hobbit',                   year: 1937, author: tolkien._id,  genres: [fantasy._id, adventure._id] },
    { title: 'The Fellowship of the Ring',   year: 1954, author: tolkien._id,  genres: [fantasy._id, adventure._id, classic._id] },
    { title: 'The Two Towers',               year: 1954, author: tolkien._id,  genres: [fantasy._id, adventure._id] },
    { title: 'The Return of the King',       year: 1955, author: tolkien._id,  genres: [fantasy._id, classic._id] },

    // Herbert's books
    { title: 'Dune',                         year: 1965, author: herbert._id,  genres: [scifi._id, adventure._id, classic._id] },
    { title: 'Dune Messiah',                 year: 1969, author: herbert._id,  genres: [scifi._id] },

    // Rowling's books
    { title: "Harry Potter and the Philosopher's Stone", year: 1997, author: rowling._id, genres: [fantasy._id, magic._id, adventure._id] },
    { title: 'Harry Potter and the Chamber of Secrets',  year: 1998, author: rowling._id, genres: [fantasy._id, magic._id] },
    { title: 'Harry Potter and the Prisoner of Azkaban', year: 1999, author: rowling._id, genres: [fantasy._id, magic._id, mystery._id] },

    // Orwell's books
    { title: 'Animal Farm',  year: 1945, author: orwell._id, genres: [classic._id, dystopia._id] },
    { title: '1984',         year: 1949, author: orwell._id, genres: [classic._id, dystopia._id, scifi._id] },

    // Christie's books
    { title: 'Murder on the Orient Express', year: 1934, author: christie._id, genres: [mystery._id, classic._id] },
    { title: 'And Then There Were None',     year: 1939, author: christie._id, genres: [mystery._id, classic._id] },
  ]);

  console.log(`\n📚 Books inserted: ${books.length} books`);
  books.forEach(b => console.log(`   "${b.title}" (${b.year})`));

  // ── SHOW RELATIONSHIPS ─────────────────────────────────
  console.log('\n─────────────────────────────────────────────');
  console.log('📊 RELATIONSHIP SUMMARY');
  console.log('─────────────────────────────────────────────');

  // One-to-many: books per author
  console.log('\n🔗 ONE-TO-MANY  (Author → Books)');
  const authors = [tolkien, herbert, rowling, orwell, christie];
  for (const a of authors) {
    const count = await Book.countDocuments({ author: a._id });
    console.log(`   ${a.name.padEnd(20)} → ${count} books`);
  }

  // Many-to-many: books per genre
  console.log('\n🔗 MANY-TO-MANY  (Genre ↔ Books)');
  const allGenres = [fantasy, scifi, adventure, classic, mystery, dystopia, magic];
  for (const g of allGenres) {
    const count = await Book.countDocuments({ genres: g._id });
    console.log(`   ${g.name.padEnd(12)} → ${count} books`);
  }

  console.log('\n✅ Seed complete! Now run: node server.js');
  console.log('   Then open: http://localhost:3000\n');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
