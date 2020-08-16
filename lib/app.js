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

app.get('/books', async(req, res) => {
  const data = await client.query(`SELECT *  
  FROM books
  JOIN genres
  ON books.genre_id = genres.id`); 
  
  res.json(data.rows);
});

app.get('/books/:id', async(req, res) => {
  const bookId = req.params.id;

  const data = await client.query(`SELECT * from books where id=${bookId}`);
  
  res.json(data.rows[0]);
});
//CRU_Delete
app.delete('/books/:id', async(req, res) => {
  const bookId = req.params.id;

  const data = await client.query(`
  DELETE FROM books WHERE book.id=$1;`, [bookId]);
  
  res.json(data.rows[0]);
});

app.post('/books', async(req, res) =>  {

  const data = await client.query(`
  INSERT INTO books(title, genre, inventory, is_available, owner_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *
  `, [req.body.title, req.body.genre, req.body.inventory, req.body.is_available, 1]);
  res.json(data.rows[0]);
});



app.get('/books', async(req, res) => {
  const data = await client.query('SELECT * from books');

  res.json(data.rows);
});

app.use(require('./middleware/error'));

module.exports = app;
