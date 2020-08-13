require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns animals', async() => {

    const expectation = [
      {
        Title: 'The Harsh Cry Of The Heroin',
        Genre: 'Fiction',
        Inventory: 3,
        is_available:true,
      },
      {
        Title: 'The Subtle Art Of Not Giving A F*ck',
        Genre: 'Self Help',
        Inventory: 4,
        is_available:true,
      },
      {
        Title: 'Broken Monsters',
        Genre: 'Fantasy',
        Inventory: 10,
        is_available:true,
      },
      {
        Title: 'The Noma Guide to Fermentation',
        Genre: 'Cooking',
        Inventory: 0,
        is_available:false,
      }
    ];

    const data = await fakeRequest(app)
      .get('/books')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
