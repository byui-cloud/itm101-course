// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;  // Google Cloud Shell allows previewing this port

const MIME_TYPES = {
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
};


const server = http.createServer((request, result) => {
	function sendError(code, message, internal) {
		console.log(`${code} ${message}`);
		if (internal) {
			console.log($`    {internal}`);
		}
		result.writeHead(code);
		result.end(message);
	}


	if (request.url.indexOf("..") !== -1) {
		sendError(403, `${request.url} is forbidden`);
	}
	else {
		let filePath = path.join(__dirname, request.url.slice(1));
		fs.stat(filePath, (err, stats) => {
			if (err) {
				const suffix = path.extname(request.url).slice(1);
				if (suffix.length > 0 && (suffix in MIME_TYPES) === false) {
					sendError(403, `${request.url} is forbidden`);
				}
				else {
					if (err.code === 'ENOENT') {
						sendError(404, `Error ${request.url} not found`);
					}
					else {
						sendError(500, `Error finding ${request.url}`, err);
					}
				}
			}
			else {
				if (stats.isDirectory()) {
					filePath = path.join(filePath, 'index.html');
				}
				console.log(filePath);

				const suffix = path.extname(filePath).slice(1);
				if ((suffix in MIME_TYPES) === false) {
					sendError(403, `${request.url} is forbidden`);
				}
				else {
					fs.readFile(filePath, (err, data) => {
						if (err) {
							sendError(500, `Error finding ${request.url}`, err);
						}
						else {
							const mimeType = MIME_TYPES[suffix];
							result.writeHead(200, { 'Content-Type': mimeType });
							result.end(data);
						}
					});
				}
			}
		});
	}
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
