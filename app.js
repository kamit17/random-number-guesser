require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

// Configure Elasticsearch client
const esClient = new Client({
  node: process.env.ELASTICSEARCH_HOST,
  auth: {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,  // Disable SSL validation for self-signed certificates
  },
});

app.use(express.json());

// Log requests to Elasticsearch
app.use(morgan('combined', {
  stream: {
    write: async (message) => {
      await esClient.index({
        index: 'app-logs',
        body: { message, timestamp: new Date() },
      });
    },
  },
}));

// Serve static files from 'public' directory
app.use(express.static('public'));

const secretNumber = _.random(1, 10);
console.log(`🔢 Secret Number: ${secretNumber}`);

// Root endpoint
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Random Number Guesser!</h1>');
});

// Handle guess submissions and log to Elasticsearch
app.post('/guess', async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ message: 'Enter a number' });

    let result = '❌ Try again!';
    if (parseInt(number) === secretNumber) {
        result = '🎉 Correct!';
    }

    // Log the guess attempt to Elasticsearch
    await esClient.index({
        index: 'game-data',
        body: {
            number: parseInt(number),
            result,
            timestamp: new Date(),
        },
    });

    return res.json({ message: result });
});

if (require.main === module) {
    app.listen(port, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${port}`));
}

module.exports = app;

