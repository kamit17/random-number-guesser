const request = require('supertest');
const app = require('../app');  // Import the app, don't start a new server

describe('API Tests', () => {
    let server;

    beforeAll((done) => {
        server = app.listen(4000, done);  // Start test server on port 4000
    });

    afterAll((done) => {
        server.close(done);  // Close the server after tests
    });

    test('Health Check', async () => {
        const res = await request(server).get('/');
        expect(res.statusCode).toBe(200);
    });
});

