// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080; // Google Cloud Shell allows previewing this port

const KNOWN_FILES = ['/index.html', '/script.js', '/style.css', '/favicon.webp'];
const MIME_TYPES = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
    webp: 'image/webp'
};

const server = http.createServer((request, result) => {
    if (request.url == '/') {
        request.url = '/index.html';
    }

    if (KNOWN_FILES.includes(request.url)) {
        const filePath = path.join(__dirname, request.url.slice(1));
        fs.readFile(filePath, (err, data) => {
            if (err) {
                result.writeHead(500);
                result.end(`Error loading ${request.url}`);
            } else {
                const suffix = path.extname(filePath).slice(1);
                const mimeType = MIME_TYPES[suffix];
                result.writeHead(200, { 'Content-Type': mimeType });
                result.end(data);
            }
        });
    } else {
        result.writeHead(404);
        result.end(`File ${request.url} not found`);
    }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
