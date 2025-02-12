require('dotenv').config();
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Ensures WSL and external connections can access

// Logging setup
const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'server.log'), { flags: 'a' });

app.use(express.json());
app.use(morgan('combined', { stream: logStream }));
app.use(express.static('public'));

const secretNumber = _.random(1, 10);
console.log(`🔢 Secret Number: ${secretNumber}`);

app.post('/guess', (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ message: 'Enter a number' });
    if (parseInt(number) === secretNumber) return res.json({ message: '🎉 Correct!' });
    return res.json({ message: '❌ Try again!' });
});
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Random Number Guesser!</h1>');
});


// Ensure the app does not crash due to port conflicts
if (require.main === module) {
    const server = app.listen(port, host, () => {
        console.log(`🚀 Server running on http://${host}:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${port} is already in use. Trying another port...`);
            const newPort = port + 1;
            app.listen(newPort, host, () => console.log(`🚀 Server running on http://${host}:${newPort}`));
        } else {
            console.error('❌ Server error:', err);
        }
    });
}

// Export app for testing
module.exports = app;

