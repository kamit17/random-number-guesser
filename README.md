Random Number Guesser

A simple web-based number guessing game using Node.js, Express, and Nginx as a reverse proxy. The goal is to guess a randomly generated number between 1 and 10. The app is deployed using PM2, and logs are managed using Nginx.

🚀 Project Setup

1️⃣ Prerequisites

Ensure you have the following installed:

Node.js (v16 or later)

Nginx (as a reverse proxy)

PM2 (for process management)

Git (for version control)

2️⃣ Clone the Repository

git clone https://github.com/kamit17/random-number-guesser.git

3️⃣ Install Dependencies

npm install

4️⃣ Configure Environment Variables

Create a .env file in the project root:

nano .env

Add the following:
PORT=3000


5️⃣ Start the Application with PM2

pm install -g pm2  # Install PM2 globally
pm2 start app.js --name random-number-guesser
pm2 save
pm2 startup

This ensures the app restarts on reboot.

🌐 Nginx Configuration

1️⃣ Create an Nginx Configuration File

sudo nano /etc/nginx/conf.d/random-number-guesser.conf

Paste the following:

server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}

Save and exit.

2️⃣ Restart Nginx

sudo systemctl restart nginx

🕹️ How to Play

Open your browser and visit: http://localhost/

Enter a number between 1 and 10 and click "Submit".

If your guess is correct, you win! Otherwise, try again.

📜 API Endpoints

Method

Endpoint

Description

GET

/

Serves the game UI

POST

/guess

Accepts a number and returns success/failure

Example API request:

curl -X POST http://localhost/guess -H "Content-Type: application/json" -d '{"number": 5}'

Response:

{"message":"❌ Try again!"}


