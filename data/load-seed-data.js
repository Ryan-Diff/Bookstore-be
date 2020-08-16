const client = require('../lib/client');
// import our seed data:
const books = require('./books.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const  genreData  = require('./genres.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    await Promise.all(
      genreData.map(genre => {
        return client.query(`
                      INSERT INTO genres (type)
                      VALUES ($1)
                  `,
        [genre.type]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      books.map(book => {
        return client.query(`
                    INSERT INTO books (title, genre_id, inventory, is_available, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [book.title, book.genre_id, book.inventory, book.is_available, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
