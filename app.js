require('dotenv').config();
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;
const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'server.log'), { flags: 'a' });

app.use(express.json());
app.use(morgan('combined', { stream: logStream }));
app.use(express.static('public'));

const secretNumber = _.random(1, 10);
console.log(`Secret Number: ${secretNumber}`);

app.post('/guess', (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ message: 'Enter a number' });
    if (parseInt(number) === secretNumber) return res.json({ message: '🎉 Correct!' });
    return res.json({ message: '❌ Try again!' });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

