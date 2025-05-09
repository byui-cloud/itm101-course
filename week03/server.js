const http = require('http');
const fs = require('fs').promises;
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

// Default to text/plain for unknown file types.
const DEFAULT_MIME_TYPE = 'text/plain';


async function handleRequest(request, result) {
	try {
		// Block paths containing ".." for security.
		if (request.url.includes("..")) {
			sendError(result, 403, `${request.url} is forbidden`);
			return;
		}

		// Get the file extension and check if it's allowed.
		let suffix = path.extname(request.url);
		const hasSuffix = (suffix.length > 1);
		if (hasSuffix) {
			suffix = suffix.slice(1).toLowerCase();
			const suffixInMimeTypes = (suffix in MIME_TYPES);
			if (! suffixInMimeTypes) {
				sendError(result, 403, `${request.url} is forbidden (unsupported file type)`);
				return;
			}
		}

		// Clean and normalize the URL.
		let filePath = path.normalize(path.join(__dirname, request.url.slice(1)));

		// Get stats about the requested file.
		const stats = await fs.stat(filePath);

		// If the client requested a directory, default to index.html
		if (stats.isDirectory()) {
			filePath = path.join(filePath, 'index.html');
		}

		// Read the requested file.
		console.log(filePath);
		const data = await fs.readFile(filePath);

		// Send the file contents to the client.
		suffix = path.extname(filePath).slice(1).toLowerCase();
		const mimeType = MIME_TYPES[suffix] || DEFAULT_MIME_TYPE;
		result.writeHead(200, {'Content-Type': mimeType});
		result.end(data);
	}
	catch (error) {
		if (error.code === 'ENOENT') {
			sendError(result, 404, `${request.url} not found`);
			return;
		}
		sendError(result, 500, 'Server error', error);
		return;
	}
}


function sendError(result, code, message, internal) {
	console.log(`${code} ${message}`);
	if (internal) {
		console.log(`    ${internal}`);
	}
	result.writeHead(code);
	result.end(message);
}


const server = http.createServer(handleRequest);
server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
