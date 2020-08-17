const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/sign in and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

const fakeUser = {
  id: 1,
  email: 'email@email.net',
  hash: '1234',
};

//C_READ_UD
app.get('/books', async(req, res) => {
  const data = await client.query(`SELECT books.*, genres.type 
  FROM books
  JOIN genres
  ON books.genre_id=genres.id`); 
  
  res.json(data.rows);
});

//C_READ_UD
app.get('/books/:id', async(req, res) => {
  const bookId = req.params.id;

  const data = await client.query(`SELECT * from books where books.id=${bookId}`);
  res.json(data.rows[0]);
});

//CR_UPDATE_d
app.put('/books/:id', async(req, res) => {
  const bookId = req.params.id;

  try {
    const updatedBook = {
      title: req.body.title, 
      // genre: req.body.genre,
      genre_id: req.body.genre_id,
      inventory: req.body.inventory, 
      is_available: req.body.is_available
    };

    const data = await client.query(`
    UPDATE books
    SET title=$1, genre=$2, genre.id=$3, inventory=$4, is_available=$5
    WHERE genre_id=$3
    RETURNING *
    `, [updatedBook.title, updatedBook.genre, updatedBook.genre.id, updatedBook.inventory, updatedBook.is_available, bookId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }

});

//CRU_Delete
app.delete('/books/:id', async(req, res) => {
  const bookId = req.params.id;
  const data = await client.query(`
  DELETE FROM books WHERE books.id=$1;`, [bookId]);
  
  res.json(data.rows[0]);
});

//Create_RUD
app.post('/books', async(req, res) =>  {
  try {
    const realNewBook = {
      title: req.body.title,  
      genre_id: req.body.genre_id,
      inventory: req.body.inventory,
      is_available: req.body.is_available
    };
    const data = await client.query(`
    INSERT INTO books(title, genre_id, inventory, is_available, owner_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `, [realNewBook.title, realNewBook.genre_id, realNewBook.inventory, realNewBook.is_available, 1]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});



app.get('/genres', async(req, res) => {
  const data = await client.query('SELECT * from genres');

  res.json(data.rows);
});

app.use(require('./middleware/error'));

module.exports = app;
