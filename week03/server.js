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
			console.log(`    ${internal}`);
		}
		result.writeHead(code);
		result.end(message);
	}


	/* Request possibilities and results:
	 * 1. Request contains .. -> 403
	 * 2. Request has a suffix and suffix not in MIME_TYPES -> 403
	 * 3. Request (file or directory) doesn't exist -> 404
	 * 4. Request exists and is a directory -> Change request to dir/index.html
	 * 5. Request doesn't have a suffix or suffix isn't in MIME_TYPES -> 403
	 * 6. Request doesn't exist or can't be read -> 404
	 * 7. Request has a suffix, suffix is in MIME_TYPES, request exists,
	 *        request can be read, and request is a file -> 200
	 */
	const containsDotDot = (request.url.indexOf("..") !== -1);
	if (containsDotDot) {
		sendError(403, `${request.url} is forbidden`);  // 1.
		return;
	}

	let suffix = path.extname(request.url);
	const hasSuffix = (suffix.length > 1);
	if (hasSuffix) {
		suffix = suffix.slice(1);
		const suffixInMimeTypes = (suffix in MIME_TYPES);
		if (! suffixInMimeTypes) {
			sendError(403, `${request.url} is forbidden`);  // 2.
			return;
		}
	}

	let filePath = path.join(__dirname, request.url.slice(1));
	fs.stat(filePath, (err, stats) => {
		if (err) {
			if (err.code === 'ENOENT') {
				sendError(404, `Error ${request.url} not found`);  // 3.
			}
			else {
				sendError(500, `Error finding ${request.url}`, err);
			}
		}
		else {
			if (stats.isDirectory()) {
				filePath = path.join(filePath, 'index.html');  // 4.
			}
			console.log(filePath);

			let suffix = path.extname(filePath);
			const hasSuffix = (suffix.length > 1);
			let suffixInMimeTypes = false;
			if (hasSuffix) {
				suffix = suffix.slice(1);
				suffixInMimeTypes = (suffix in MIME_TYPES);
			}
			if (! hasSuffix || ! suffixInMimeTypes) {
				sendError(403, `${request.url} is forbidden`);  // 5.
			}
			else {
				fs.readFile(filePath, (err, data) => {
					if (err) {
						if (err.code === 'ENOENT') {
							sendError(404, `Error ${request.url} not found`);  // 6.
						}
						else {
							sendError(500, `Error finding ${request.url}`, err);
						}
					}
					else {
						const mimeType = MIME_TYPES[suffix];
						result.writeHead(200, { 'Content-Type': mimeType });  // 7.
						result.end(data);
					}
				});
			}
		}
	});
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
