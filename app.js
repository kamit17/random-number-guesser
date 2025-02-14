require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

// 🔵 Function to Create Elasticsearch Client with Retry Mechanism
async function createElasticsearchClient() {
    let esClient;
    let retries = 5; // Max retries
    const retryInterval = 5000; // 5 seconds

    while (retries > 0) {
        try {
            esClient = new Client({
                node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200',
                auth: {
                    username: process.env.ELASTICSEARCH_USER || 'elastic',
                    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
                },
                tls: { rejectUnauthorized: false }, // Disable SSL validation for self-signed certificates
            });

            await esClient.ping(); // Check if Elasticsearch is available
            console.log('✅ Connected to Elasticsearch');
            return esClient;
        } catch (error) {
            console.error(`❌ Failed to connect to Elasticsearch (Attempts left: ${retries - 1})`);
            retries--;
            await new Promise((res) => setTimeout(res, retryInterval)); // Wait before retrying
        }
    }

    throw new Error('❌ Elasticsearch is not available. Exiting application.');
}

// 🔵 Initialize Elasticsearch Client
let esClient;
(async () => {
    try {
        esClient = await createElasticsearchClient();
        startServer(); // Start Express server after successful ES connection
    } catch (error) {
        console.error(error);
        process.exit(1); // Exit the application if ES is not available
    }
})();

app.use(express.json());

// 🔵 Log requests to Elasticsearch
app.use(morgan('combined', {
    stream: {
        write: async (message) => {
            try {
                await esClient.index({
                    index: 'app-logs',
                    body: { message, timestamp: new Date() },
                });
            } catch (error) {
                console.error('❌ Failed to log to Elasticsearch:', error.message);
            }
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

    if (parseInt(number) === secretNumber) {
        return res.json({ message: '🎉 Correct!' });
    } else {
        return res.json({ message: '❌ Try again!' });
    }
});

// 🔵 Start Express Server After Successful Elasticsearch Connection
function startServer() {
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
}

module.exports = app;

