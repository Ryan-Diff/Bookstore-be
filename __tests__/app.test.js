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

  test('returns books', async() => {

    const expectation = [
      { id: 1,
        title: 'The Harsh Cry Of The Heroin',
        genre: 'Fiction',
        inventory: 3,
        is_available:true,
        owner_id:1,
      },
      {
        id: 2,
        title: 'The Subtle Art Of Not Giving A F*ck',
        genre: 'Self Help',
        inventory: 4,
        is_available:true,
        owner_id:1,
      },
      {
        id: 3,
        title: 'Broken Monsters',
        genre: 'Fantasy',
        inventory: 10,
        is_available:true,
        owner_id:1,
      },
      {
        id: 4,
        title: 'The Noma Guide to Fermentation',
        genre: 'Cooking',
        inventory: 0,
        is_available:false,
        owner_id:1,
      }
    ];

    const data = await fakeRequest(app)
      .get('/books')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
