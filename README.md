# MongoDB CRUD — One-to-Many & Many-to-Many

## ── STEP 1: Install MongoDB ──────────────────────────────────

### Windows
1. Download from https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete")
3. MongoDB runs as a Windows service automatically

### macOS
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community

### Ubuntu/Debian
  sudo apt-get install -y mongodb
  sudo systemctl start mongod
  sudo systemctl enable mongod

Verify it's running:
  mongosh          # should open a MongoDB shell


## ── STEP 2: Install Node.js ──────────────────────────────────

Download from https://nodejs.org  (choose LTS version)
Verify: node --version && npm --version


## ── STEP 3: Set up this project ─────────────────────────────

  # 1. Go into the project folder
  cd mongodb-crud

  # 2. Install dependencies
  npm install

  # 3. Start the server
  node server.js

  # OR for auto-restart on file changes:
  npm run dev


## ── STEP 4: Open the app ─────────────────────────────────────

  http://localhost:3000


## ── API Reference ────────────────────────────────────────────

Test with curl or Postman:

### Authors (one-to-many PARENT)
  GET    /api/authors
  POST   /api/authors          { "name": "Tolkien", "country": "UK" }
  GET    /api/authors/:id      (returns author + their books)
  PUT    /api/authors/:id      { "country": "England" }
  DELETE /api/authors/:id      (cascades: deletes their books too)

### Genres (many-to-many)
  GET    /api/genres
  POST   /api/genres           { "name": "Fantasy" }
  GET    /api/genres/:id       (returns genre + all books tagged with it)
  DELETE /api/genres/:id       ($pull from all books' genres array)

### Books (many-side + many-to-many)
  GET    /api/books            (populated: author name + genre names)
  POST   /api/books            { "title": "Dune", "year": 1965, "author": "<id>", "genres": ["<id>", "<id>"] }
  GET    /api/books/:id
  PUT    /api/books/:id
  DELETE /api/books/:id
  GET    /api/books/aggregate/stats   (raw $lookup aggregation pipeline)


## ── Key concepts in this project ────────────────────────────

ONE-TO-MANY (Author → Books):
  Each Book stores a single author field with an ObjectId reference.
  Query: Book.find({ author: authorId })
  Delete cascade: Book.deleteMany({ author: authorId })

MANY-TO-MANY (Books ↔ Genres):
  Each Book stores a genres array of ObjectId references.
  No junction table needed (unlike SQL).
  Query: Book.find({ genres: genreId })
  Cleanup: Book.updateMany({}, { $pull: { genres: genreId } })

POPULATE (like SQL JOIN):
  Book.find().populate('author').populate('genres')
  Replaces ObjectId references with actual documents.

AGGREGATE (raw pipeline):
  GET /api/books/aggregate/stats shows $lookup which is the
  underlying operation that .populate() uses.
